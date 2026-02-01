import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
// AGREGAMOS 'runTransaction' AQUI
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, runTransaction } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { LogOut, LayoutDashboard, FileText, Truck, CheckCircle, PlusCircle, X } from 'lucide-react';

import MoveCard from '../../components/dashboard/MoveCard';
import EditMoveModal from '../../components/dashboard/EditMoveModal';

const TabButton = ({ label, icon, active, onClick, count }) => (
  <button onClick={onClick} className={`flex items-center gap-2 py-4 border-b-4 font-bold transition whitespace-nowrap px-4 ${active ? 'border-cadena-pink text-cadena-pink' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
    {icon} {label} {count > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-pink-100 text-cadena-pink' : 'bg-gray-100 text-gray-500'}`}>{count}</span>}
  </button>
);
const EmptyState = ({ msg }) => (<div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100"><p className="text-gray-400 font-medium">{msg}</p></div>);
const Modal = ({ title, onClose, children }) => (<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"><div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[95vh] overflow-y-auto"><div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 shadow-sm"><h3 className="font-bold text-xl text-gray-800">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"><X size={20}/></button></div><div className="p-8">{children}</div></div></div>);

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cotizaciones');
  const [moves, setMoves] = useState([]);
  
  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMove, setEditingMove] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [newMove, setNewMove] = useState({ client: '', phone: '', origin: '', destination: '', date: '' });

  useEffect(() => {
    const qMoves = query(collection(db, "moves"), orderBy("createdAt", "desc"));
    const unsubMoves = onSnapshot(qMoves, (snapshot) => {
      setMoves(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubMoves();
  }, []);

  const pendingMoves = moves.filter(m => m.status === 'Pendiente');
  const activeMoves = moves.filter(m => ['Programada', 'Contrato Firmado', 'En Carga', 'En Tránsito'].includes(m.status));
  const finishedMoves = moves.filter(m => m.status === 'Finalizada');

  const handleLogout = async () => { await signOut(auth); navigate('/admin'); };
  const handleDelete = async (id) => { if (confirm("¿Eliminar registro?")) await deleteDoc(doc(db, "moves", id)); };
  
  const copyContractLink = (id) => { 
    const baseUrl = window.location.href.split('#')[0];
    const url = `${baseUrl}#/contrato/${id}`;
    navigator.clipboard.writeText(url); 
    alert("Enlace copiado."); 
  };

  // --- NUEVA LÓGICA DE CREACIÓN SECUENCIAL ---
  const handleCreateMove = async (e) => {
    e.preventDefault();
    
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Referencia al contador global
        const counterRef = doc(db, "counters", "moves_counter");
        const counterSnap = await transaction.get(counterRef);

        // 2. Calcular el siguiente número
        let newCount = 1;
        if (counterSnap.exists()) {
          newCount = counterSnap.data().current + 1;
        }

        // 3. Formatear Folio (Ej: MUD-0025)
        const folio = `MUD-${String(newCount).padStart(4, '0')}`;

        // 4. Preparar datos
        const defaultFinancials = [{ description: "SERVICIO DE FLETE EXCLUSIVO...", cost: 0, quantity: 1 }, { description: "MANIOBRA...", cost: 0, quantity: 1 }];
        
        // 5. Crear referencia para la nueva mudanza
        const newMoveRef = doc(collection(db, "moves"));

        // 6. Ejecutar escrituras
        transaction.set(newMoveRef, { 
          ...newMove, 
          folio: folio, 
          status: 'Pendiente', 
          items: [], 
          price: 0, subtotal: 0, iva: 0, retention: 0, 
          financialItems: defaultFinancials, 
          createdAt: new Date() 
        });

        // 7. Actualizar el contador
        transaction.set(counterRef, { current: newCount });
      });

      setIsCreateModalOpen(false); 
      setNewMove({ client: '', phone: '', origin: '', destination: '', date: '' });
      alert("Registro creado con éxito.");

    } catch (error) {
      console.error("Error creando folio:", error);
      alert("Error al generar folio secuencial. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-2 text-cadena-pink font-black text-xl tracking-tight"><LayoutDashboard className="text-cadena-blue" /> Panel Cadena</div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 font-medium text-sm flex gap-2 transition"><LogOut size={18} /> Salir</button>
      </nav>

      <div className="bg-white px-4 sm:px-8 shadow-sm relative z-10">
        <div className="flex space-x-8 overflow-x-auto">
          <TabButton label="Solicitudes Nuevas" icon={<FileText size={18}/>} active={activeTab === 'cotizaciones'} onClick={() => setActiveTab('cotizaciones')} count={pendingMoves.length} />
          <TabButton label="Operaciones Activas" icon={<Truck size={18}/>} active={activeTab === 'operaciones'} onClick={() => setActiveTab('operaciones')} count={activeMoves.length} />
          <TabButton label="Historial Finalizado" icon={<CheckCircle size={18}/>} active={activeTab === 'historial'} onClick={() => setActiveTab('historial')} count={finishedMoves.length} />
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PESTAÑA 1: NUEVAS */}
        {activeTab === 'cotizaciones' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-700">Solicitudes Recientes</h2>
            {pendingMoves.length === 0 ? <EmptyState msg="Sin solicitudes nuevas." /> : (
              <div className="grid gap-4">
                {pendingMoves.map(move => (
                  <MoveCard key={move.id} move={move} onEdit={() => setEditingMove(move)} onDelete={() => handleDelete(move.id)} onCopyLink={() => copyContractLink(move.id)} onViewId={() => setViewingId(move)} isPending={true} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: ACTIVAS */}
        {activeTab === 'operaciones' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-700">Operaciones Activas</h2>
              <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex gap-2 font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"><PlusCircle size={20} /> Crear Manual</button>
            </div>
            {activeMoves.length === 0 ? <EmptyState msg="Sin operaciones activas." /> : (
              <div className="grid gap-4">
                {activeMoves.map(move => (
                  <MoveCard key={move.id} move={move} onEdit={() => setEditingMove(move)} onCopyLink={() => copyContractLink(move.id)} onDelete={() => handleDelete(move.id)} onViewId={() => setViewingId(move)} onPrintOrder={() => navigate(`/orden-carga/${move.id}`)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-700">Historial de Servicios</h2>
            {finishedMoves.length === 0 ? <EmptyState msg="Aún no hay mudanzas finalizadas." /> : (
              <div className="grid gap-4 opacity-80 hover:opacity-100 transition duration-300">
                {finishedMoves.map(move => (
                  <MoveCard key={move.id} move={move} onEdit={() => setEditingMove(move)} onCopyLink={() => copyContractLink(move.id)} onDelete={() => handleDelete(move.id)} onViewId={() => setViewingId(move)} onPrintOrder={() => navigate(`/orden-carga/${move.id}`)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODALES --- */}
      {editingMove && (
        <EditMoveModal 
          moveData={editingMove} 
          onClose={() => setEditingMove(null)} 
          onSuccess={() => setEditingMove(null)}
        />
      )}

      {viewingId && (
        <Modal title={`Documentación: ${viewingId.client}`} onClose={() => setViewingId(null)}>
           <div className="grid grid-cols-1 gap-8">
              <div><p className="font-black text-gray-400 mb-3 uppercase text-xs tracking-widest border-b pb-1">Identificación (INE):</p>{viewingId.idUrl ? <img src={viewingId.idUrl} className="w-full rounded-xl border shadow-sm" /> : <p className="text-gray-400 italic text-sm py-4 text-center bg-gray-50 rounded">No adjuntado</p>}</div>
              <div><p className="font-black text-gray-400 mb-3 uppercase text-xs tracking-widest border-b pb-1">Comprobante de Domicilio:</p>{viewingId.addressUrl ? <img src={viewingId.addressUrl} className="w-full rounded-xl border shadow-sm" /> : <p className="text-gray-400 italic text-sm py-4 text-center bg-gray-50 rounded">No adjuntado</p>}</div>
           </div>
        </Modal>
      )}

      {isCreateModalOpen && (
        <Modal title="Nueva Mudanza Manual" onClose={() => setIsCreateModalOpen(false)}>
          <form onSubmit={handleCreateMove} className="space-y-6">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nombre del Cliente</label><input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue focus:bg-white transition text-sm" placeholder="Ej. Juan Pérez" value={newMove.client} onChange={e => setNewMove({...newMove, client: e.target.value})} required/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Origen</label><input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue focus:bg-white transition text-sm" placeholder="Colonia / Ciudad" value={newMove.origin} onChange={e => setNewMove({...newMove, origin: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Destino</label><input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue focus:bg-white transition text-sm" placeholder="Colonia / Ciudad" value={newMove.destination} onChange={e => setNewMove({...newMove, destination: e.target.value})} /></div>
            </div>
            <button className="w-full bg-cadena-pink hover:bg-pink-600 text-white font-bold py-3 rounded-xl shadow-md transition">Crear Registro</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;