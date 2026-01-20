import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
// AQUÍ ESTABA EL ERROR: Faltaba importar ClipboardList
import { LogOut, PlusCircle, LayoutDashboard, MapPin, Truck, CheckCircle, X, ClipboardList } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newMove, setNewMove] = useState({
    client: '',
    phone: '',
    origin: '',
    destination: '',
    date: ''
  });

  useEffect(() => {
    const q = query(collection(db, "moves"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const movesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMoves(movesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin');
  };

  const handleCreateMove = async (e) => {
    e.preventDefault();
    try {
      const randomFolio = 'MUD-' + Math.floor(1000 + Math.random() * 9000);
      await addDoc(collection(db, "moves"), {
        folio: randomFolio,
        client: newMove.client,
        phone: newMove.phone,
        origin: newMove.origin,
        destination: newMove.destination,
        date: newMove.date,
        status: 'Programada',
        porcentaje: 0,
        createdAt: new Date()
      });
      setIsModalOpen(false);
      setNewMove({ client: '', phone: '', origin: '', destination: '', date: '' });
      alert(`¡Mudanza creada! El folio es: ${randomFolio}`);
    } catch (error) {
      console.error("Error al crear:", error);
      alert("Hubo un error al guardar.");
    }
  };

  const advanceStatus = async (id, currentStatus) => {
    const statusMap = {
      'Programada': { next: 'En Carga', pct: 25 },
      'En Carga': { next: 'En Tránsito', pct: 60 },
      'En Tránsito': { next: 'Finalizada', pct: 100 },
      'Finalizada': { next: 'Finalizada', pct: 100 }
    };
    const nextStep = statusMap[currentStatus];
    if (nextStep && currentStatus !== 'Finalizada') {
      const moveRef = doc(db, "moves", id);
      await updateDoc(moveRef, {
        status: nextStep.next,
        porcentaje: nextStep.pct
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-cadena-blue font-bold text-xl">
          <LayoutDashboard />
          <span className="hidden sm:inline">Panel Administrativo</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium text-sm transition">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Operaciones Activas</h1>
            <p className="text-gray-500">Gestiona los traslados en curso.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-cadena-blue hover:bg-ocean-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md font-bold"
          >
            <PlusCircle size={20} />
            Nueva Mudanza
          </button>
        </div>

        {/* LISTA DE MUDANZAS */}
        {loading ? (
          <p className="text-center text-gray-500">Cargando datos...</p>
        ) : moves.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">No hay mudanzas activas. ¡Crea la primera!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {moves.map((move) => (
              <div key={move.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Info Principal */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold font-mono">
                      {move.folio}
                    </span>
                    <h3 className="font-bold text-lg text-cadena-dark">{move.client}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-cadena-pink" />
                      {move.origin} <span className="text-gray-300">➜</span> {move.destination}
                    </div>
                    <div>📅 {move.date}</div>
                  </div>
                </div>

                {/* Estado y Acciones */}
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                    move.status === 'Finalizada' ? 'bg-green-500' : 
                    move.status === 'En Tránsito' ? 'bg-cadena-blue' : 'bg-cadena-pink'
                  }`}>
                    {move.status}
                  </div>
                  
                  {/* --- BOTÓN NUEVO: COPIAR LINK DE CONTRATO --- */}
                  <button 
                    onClick={() => {
                      // Usamos Hash en la URL
                      const url = `${window.location.origin}/#/contrato/${move.id}`;
                      navigator.clipboard.writeText(url);
                      alert("¡Link del contrato copiado! Envíalo por WhatsApp al cliente:\n" + url);
                    }}
                    className="text-gray-400 hover:text-green-600 transition border border-gray-200 p-2 rounded-full hover:bg-green-50"
                    title="Copiar Link de Contrato"
                  >
                    <ClipboardList size={20} />
                  </button>
                  {/* ------------------------------------------ */}

                  {/* Botón para avanzar estado */}
                  {move.status !== 'Finalizada' && (
                    <button 
                      onClick={() => advanceStatus(move.id, move.status)}
                      className="text-gray-400 hover:text-cadena-blue transition border border-gray-200 p-2 rounded-full hover:bg-gray-50"
                      title="Avanzar Siguiente Etapa"
                    >
                      <Truck size={20} />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-cadena-dark">Registrar Nuevo Servicio</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateMove} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cadena-blue outline-none"
                  value={newMove.client} onChange={e => setNewMove({...newMove, client: e.target.value})} placeholder="Nombre completo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                  <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cadena-blue outline-none"
                    value={newMove.origin} onChange={e => setNewMove({...newMove, origin: e.target.value})} placeholder="Ciudad" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                  <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cadena-blue outline-none"
                    value={newMove.destination} onChange={e => setNewMove({...newMove, destination: e.target.value})} placeholder="Ciudad" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input required type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cadena-blue outline-none"
                  value={newMove.date} onChange={e => setNewMove({...newMove, date: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-cadena-blue text-white font-bold py-3 rounded-lg hover:bg-ocean-dark transition mt-4">
                Crear Orden de Servicio
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;