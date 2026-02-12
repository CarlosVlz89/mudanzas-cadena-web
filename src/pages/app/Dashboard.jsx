import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, runTransaction } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { LogOut, LayoutDashboard, FileText, Truck, CheckCircle, PlusCircle, X, PenTool, AlertCircle, Calendar, DollarSign, Phone, MapPin } from 'lucide-react';

import MoveCard from '../../components/dashboard/MoveCard';
import EditMoveModal from '../../components/dashboard/EditMoveModal';

const TabButton = ({ label, icon, active, onClick, count, colorClass }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 py-4 border-b-4 font-bold transition whitespace-nowrap px-4 ${active ? `border-${colorClass} text-${colorClass}` : 'border-transparent text-gray-400 hover:text-gray-600'}`}
  >
    {icon} {label} 
    {count > 0 && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? `bg-${colorClass}/10 text-${colorClass}` : 'bg-gray-100 text-gray-500'}`}>
        {count}
      </span>
    )}
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
  
  const [newMove, setNewMove] = useState({ 
    client: '', phone: '', origin: '', destination: '', date: '', price: '', notes: '' 
  });

  useEffect(() => {
    const qMoves = query(collection(db, "moves"), orderBy("createdAt", "desc"));
    const unsubMoves = onSnapshot(qMoves, (snapshot) => {
      setMoves(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubMoves();
  }, []);

  const handleLogout = async () => { await signOut(auth); navigate('/admin'); };
  const handleDelete = async (id) => { if (confirm("¿Eliminar registro?")) await deleteDoc(doc(db, "moves", id)); };
  
  const copyContractLink = (id) => { 
    const baseUrl = window.location.href.split('#')[0];
    const url = `${baseUrl}#/contrato/${id}`;
    navigator.clipboard.writeText(url); 
    alert("Enlace copiado."); 
  };

  // Función para abrir contrato en nueva pestaña
  const openContract = (move) => {
    // Usamos el ID del movimiento para navegar
    navigate(`/admin/ver-contrato/${move.id}`);
  };

  const handleCreateMove = async (e) => {
    e.preventDefault();
    try {
      await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, "counters", "moves_counter");
        const counterSnap = await transaction.get(counterRef);
        let newCount = 1;
        if (counterSnap.exists()) { newCount = counterSnap.data().current + 1; }
        const folio = `MUD-${String(newCount).padStart(4, '0')}`;
        
        const precioTotal = Number(newMove.price) || 0;
        const defaultFinancials = [
            { description: "FLETE Y MANIOBRAS", cost: precioTotal, quantity: 1 }
        ];

        const initialStatus = (precioTotal > 0 && newMove.date) ? 'Programada' : 'Pendiente';

        const newMoveRef = doc(collection(db, "moves"));
        transaction.set(newMoveRef, { 
          ...newMove, 
          folio: folio, 
          status: initialStatus, 
          items: [], 
          price: precioTotal, 
          subtotal: precioTotal,
          iva: 0, 
          retention: 0, 
          financialItems: defaultFinancials, 
          createdAt: new Date() 
        });
        transaction.set(counterRef, { current: newCount });
      });
      setIsCreateModalOpen(false); 
      setNewMove({ client: '', phone: '', origin: '', destination: '', date: '', price: '', notes: '' });
      alert("Registro creado con éxito.");
    } catch (error) { console.error("Error creando folio:", error); alert("Error al generar registro."); }
  };

  const getFolioNumber = (move) => { if (!move.folio) return 0; return parseInt(move.folio.split('-')[1]) || 0; };
  const sortMovesByFolio = (list) => { return list.sort((a, b) => getFolioNumber(b) - getFolioNumber(a)); };

  // --- FILTROS ---
  const newRequests = sortMovesByFolio(moves.filter(m => m.status === 'Pendiente' && (!m.idUrl || !m.addressUrl)));
  const readyToSign = sortMovesByFolio(moves.filter(m => (m.status === 'Pendiente' && m.idUrl && m.addressUrl) || m.status === 'Programada'));
  const activeMoves = sortMovesByFolio(moves.filter(m => ['Contrato Firmado', 'En Carga', 'En Tránsito'].includes(m.status)));
  const finishedMoves = sortMovesByFolio(moves.filter(m => m.status === 'Finalizada'));

  // PROPS COMUNES PARA NO REPETIR CÓDIGO
  const cardProps = (move) => ({
    key: move.id,
    move: move,
    onEdit: () => setEditingMove(move),
    onDelete: () => handleDelete(move.id),
    onCopyLink: () => copyContractLink(move.id),
    onViewId: () => setViewingId(move),
    onViewContract: () => openContract(move), // <--- AQUÍ ESTÁ LA NUEVA FUNCIÓN
    isPending: move.price === 0
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-2 text-cadena-pink font-black text-xl tracking-tight"><LayoutDashboard className="text-cadena-blue" /> Panel Cadena</div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 font-medium text-sm flex gap-2 transition"><LogOut size={18} /> Salir</button>
      </nav>

      <div className="bg-white px-4 sm:px-8 shadow-sm relative z-10">
        <div className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-1 sm:pb-0">
          <TabButton label="Nuevas" icon={<FileText size={18}/>} active={activeTab === 'cotizaciones'} onClick={() => setActiveTab('cotizaciones')} count={newRequests.length} colorClass="gray-600" />
          <TabButton label="Por Firmar" icon={<PenTool size={18}/>} active={activeTab === 'por_firmar'} onClick={() => setActiveTab('por_firmar')} count={readyToSign.length} colorClass="cadena-pink" />
          <TabButton label="Activas" icon={<Truck size={18}/>} active={activeTab === 'operaciones'} onClick={() => setActiveTab('operaciones')} count={activeMoves.length} colorClass="cadena-blue" />
          <TabButton label="Historial" icon={<CheckCircle size={18}/>} active={activeTab === 'historial'} onClick={() => setActiveTab('historial')} count={finishedMoves.length} colorClass="green-600" />
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PESTAÑA 1: NUEVAS */}
        {activeTab === 'cotizaciones' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-700">Solicitudes Recientes</h2>
               <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex gap-2 font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"><PlusCircle size={20} /> Crear Manual</button>
            </div>
            {newRequests.length === 0 ? <EmptyState msg="No hay solicitudes nuevas." /> : (
              <div className="grid gap-4">
                {newRequests.map(move => <MoveCard {...cardProps(move)} />)}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: POR FIRMAR */}
        {activeTab === 'por_firmar' && (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-cadena-pink shrink-0 mt-0.5" />
                <div>
                   <h3 className="font-bold text-cadena-pink">En Proceso de Firma</h3>
                   <p className="text-sm text-gray-600">Mudanzas cotizadas esperando firma del cliente o revisión de documentos.</p>
                </div>
             </div>
            <h2 className="text-2xl font-bold text-gray-700">Listos para Revisión y Firma</h2>
            {readyToSign.length === 0 ? <EmptyState msg="Nadie está esperando revisión." /> : (
              <div className="grid gap-4">
                {readyToSign.map(move => <MoveCard {...cardProps(move)} />)}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: ACTIVAS */}
        {activeTab === 'operaciones' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-700">Operaciones en Curso</h2>
            {activeMoves.length === 0 ? <EmptyState msg="Sin operaciones firmadas en curso." /> : (
              <div className="grid gap-4">
                {activeMoves.map(move => (
                  <MoveCard 
                    {...cardProps(move)} 
                    onPrintOrder={() => navigate(`/orden-carga/${move.id}`)} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 4: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-700">Historial Finalizado</h2>
            {finishedMoves.length === 0 ? <EmptyState msg="Aún no hay mudanzas finalizadas." /> : (
              <div className="grid gap-4 opacity-80 hover:opacity-100 transition duration-300">
                {finishedMoves.map(move => (
                  <MoveCard 
                    {...cardProps(move)} 
                    onPrintOrder={() => navigate(`/orden-carga/${move.id}`)} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODALES --- */}
      {editingMove && <EditMoveModal moveData={editingMove} onClose={() => setEditingMove(null)} onSuccess={() => setEditingMove(null)} />}
      
      {viewingId && (
        <Modal title={`Documentación: ${viewingId.client}`} onClose={() => setViewingId(null)}>
           <div className="space-y-6">
              
              {/* SECCIÓN IDENTIFICACIÓN (2 COLUMNAS) */}
              <div>
                  <p className="font-black text-gray-400 mb-3 uppercase text-xs tracking-widest border-b pb-1">Identificación Oficial (INE)</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Lado Frente (Soporta registros viejos con 'idUrl') */}
                      <div>
                          <p className="text-[10px] font-bold text-gray-400 mb-1">FRENTE:</p>
                          {viewingId.idUrlFront || viewingId.idUrl ? (
                              <img src={viewingId.idUrlFront || viewingId.idUrl} className="w-full h-48 object-contain bg-gray-100 rounded-xl border shadow-sm" alt="INE Frente" />
                          ) : (
                              <div className="h-48 flex items-center justify-center bg-gray-50 text-gray-400 text-xs italic border-2 border-dashed rounded-xl">
                                Sin imagen
                              </div>
                          )}
                      </div>

                      {/* Lado Reverso */}
                      <div>
                          <p className="text-[10px] font-bold text-gray-400 mb-1">REVERSO:</p>
                          {viewingId.idUrlBack ? (
                              <img src={viewingId.idUrlBack} className="w-full h-48 object-contain bg-gray-100 rounded-xl border shadow-sm" alt="INE Reverso" />
                          ) : (
                              <div className="h-48 flex items-center justify-center bg-gray-50 text-gray-400 text-xs italic border-2 border-dashed rounded-xl">
                                Sin imagen
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* SECCIÓN DOMICILIO */}
              <div>
                  <p className="font-black text-gray-400 mb-3 uppercase text-xs tracking-widest border-b pb-1">Comprobante de Domicilio</p>
                  {viewingId.addressUrl ? (
                      <img src={viewingId.addressUrl} className="w-full max-h-80 object-contain bg-gray-100 rounded-xl border shadow-sm" alt="Domicilio" /> 
                  ) : (
                      <p className="text-gray-400 italic text-sm py-8 text-center bg-gray-50 rounded border-2 border-dashed">No adjuntado</p>
                  )}
              </div>

           </div>
        </Modal>
      )}

      {/* --- MODAL DE CREACIÓN MANUAL --- */}
      {isCreateModalOpen && (
        <Modal title="Nueva Mudanza Completa" onClose={() => setIsCreateModalOpen(false)}>
          <form onSubmit={handleCreateMove} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><UserIcon size={14}/> Nombre del Cliente</label>
                   <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue transition text-sm" placeholder="Ej. Juan Pérez" value={newMove.client} onChange={e => setNewMove({...newMove, client: e.target.value})} required/>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Phone size={14}/> Teléfono</label>
                   <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue transition text-sm" placeholder="55 1234 5678" value={newMove.phone} onChange={e => setNewMove({...newMove, phone: e.target.value})} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><MapPin size={14} className="text-green-500"/> Origen</label>
                  <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue transition text-sm" placeholder="Colonia / Ciudad" value={newMove.origin} onChange={e => setNewMove({...newMove, origin: e.target.value})} />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><MapPin size={14} className="text-red-500"/> Destino</label>
                  <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue transition text-sm" placeholder="Colonia / Ciudad" value={newMove.destination} onChange={e => setNewMove({...newMove, destination: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Calendar size={14}/> Fecha Tentativa</label>
                   <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue transition text-sm" value={newMove.date} onChange={e => setNewMove({...newMove, date: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><DollarSign size={14}/> Precio Estimado ($)</label>
                   <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue transition text-sm font-bold text-green-600" placeholder="0.00" value={newMove.price} onChange={e => setNewMove({...newMove, price: e.target.value})} />
                   <p className="text-[10px] text-gray-400 mt-1">Si pones precio, la mudanza pasará a "Programada".</p>
                </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notas / Observaciones</label>
               <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue transition text-sm h-20" placeholder="Ej. Casa de 3 pisos, volado, piano..." value={newMove.notes} onChange={e => setNewMove({...newMove, notes: e.target.value})} />
            </div>

            <button className="w-full bg-cadena-pink hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-md transition flex justify-center items-center gap-2 text-lg">
                <PlusCircle size={24}/> Crear Registro Completo
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const UserIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default Dashboard;