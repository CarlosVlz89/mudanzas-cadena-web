import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { 
  LogOut, PlusCircle, LayoutDashboard, MapPin, Truck, Phone, MessageCircle, 
  Trash2, Edit3, X, ClipboardList, Save, FileText, StickyNote, CreditCard, Plus, CheckCircle, Printer
} from 'lucide-react'; // <--- Agregamos 'Printer'

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cotizaciones');
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMove, setEditingMove] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  // Estados formularios
  const [newMove, setNewMove] = useState({ client: '', phone: '', origin: '', destination: '', date: '' });
  
  // Estado temporal para agregar un nuevo item al editar
  const [tempItem, setTempItem] = useState({ name: '', quantity: 1 });

  useEffect(() => {
    const qMoves = query(collection(db, "moves"), orderBy("createdAt", "desc"));
    const unsubMoves = onSnapshot(qMoves, (snapshot) => {
      setMoves(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubMoves();
  }, []);

  const pendingMoves = moves.filter(m => m.status === 'Pendiente');
  const activeMoves = moves.filter(m => ['Programada', 'Contrato Firmado', 'En Carga', 'En Tránsito'].includes(m.status));
  const finishedMoves = moves.filter(m => m.status === 'Finalizada');

  const handleLogout = async () => { await signOut(auth); navigate('/admin'); };
  const handleDelete = async (id) => { if (confirm("¿Eliminar registro?")) await deleteDoc(doc(db, "moves", id)); };
  
  const copyContractLink = (id) => { 
    const url = `${window.location.origin}/#/contrato/${id}`;
    navigator.clipboard.writeText(url); 
    alert("Enlace del contrato copiado."); 
  };

  // --- NUEVA FUNCIÓN: GENERAR ORDEN DE CARGA (PDF/IMPRESIÓN) ---
  const handlePrintOrder = (move) => {
    const printWindow = window.open('', '_blank');
    const itemsList = move.items && move.items.length > 0 
      ? move.items.map(item => `<tr><td style="padding:8px; border-bottom:1px solid #eee;">${item.quantity}</td><td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td></tr>`).join('')
      : '<tr><td colspan="2" style="padding:10px; text-align:center; color:#999;">Sin inventario registrado</td></tr>';

    const htmlContent = `
      <html>
        <head>
          <title>Orden de Carga - ${move.folio}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #ec4899; padding-bottom: 20px; margin-bottom: 30px; }
            .brand h1 { margin: 0; font-size: 24px; color: #1e293b; }
            .brand span { color: #ec4899; }
            .folio { text-align: right; }
            .folio h2 { margin: 0; font-size: 18px; color: #64748b; }
            .folio-num { font-size: 24px; font-weight: bold; color: #ec4899; font-family: monospace; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
            .data { font-size: 16px; margin-bottom: 15px; font-weight: 500; }
            .big-data { font-size: 18px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background: #f8fafc; padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b; }
            .notes-box { background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .footer { margin-top: 50px; border-top: 2px dashed #cbd5e1; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
            .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
            .sig-line { width: 40%; border-top: 1px solid #333; text-align: center; padding-top: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <h1>MUDANZAS <span>CADENA</span></h1>
              <div style="font-size:12px; color:#64748b;">Orden de Servicio Operativo</div>
            </div>
            <div class="folio">
              <h2>FOLIO</h2>
              <div class="folio-num">${move.folio}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Datos del Cliente</div>
              <div class="big-data">${move.client}</div>
              <div class="data">Tel: ${move.phone || 'No registrado'}</div>
              
              <div class="section-title" style="margin-top:20px;">Fecha Programada</div>
              <div class="data">${move.date || 'Por definir'}</div>
            </div>
            
            <div>
              <div class="section-title">Ruta Logística</div>
              <div style="margin-bottom:15px;">
                <span style="font-size:10px; color:#ec4899; font-weight:bold;">ORIGEN (RECOLECCIÓN)</span>
                <div class="data">${move.origin}</div>
              </div>
              <div>
                <span style="font-size:10px; color:#2563eb; font-weight:bold;">DESTINO (ENTREGA)</span>
                <div class="data">${move.destination}</div>
              </div>
            </div>
          </div>

          <div class="section-title">Inventario de Artículos</div>
          <table>
            <thead>
              <tr>
                <th width="15%">Cant.</th>
                <th>Descripción del Artículo</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          ${move.notes ? `
            <div class="notes-box">
              <strong>⚠ Notas Operativas:</strong><br/>
              ${move.notes}
            </div>
          ` : ''}

          <div class="signatures">
            <div class="sig-line">Firma Cliente (Conformidad)</div>
            <div class="sig-line">Firma Chofer / Responsable</div>
          </div>

          <div class="footer">
            Documento generado para uso interno y operativo. No válido como factura fiscal.
          </div>
          
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- LÓGICA DE EDICIÓN ---
  const removeItem = (index) => {
    const newItems = [...editingMove.items];
    newItems.splice(index, 1);
    setEditingMove({ ...editingMove, items: newItems });
  };

  const addItem = () => {
    if (!tempItem.name) return;
    const newItems = [...(editingMove.items || []), { ...tempItem }];
    setEditingMove({ ...editingMove, items: newItems });
    setTempItem({ name: '', quantity: 1 });
  };

  const handleUpdateMove = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "moves", editingMove.id), {
        client: editingMove.client,
        phone: editingMove.phone,
        origin: editingMove.origin,
        destination: editingMove.destination,
        price: Number(editingMove.price),
        status: editingMove.status,
        notes: editingMove.notes,
        items: editingMove.items 
      });
      setEditingMove(null);
      alert("Servicio actualizado correctamente.");
    } catch (error) { console.error(error); }
  };

  const handleCreateMove = async (e) => {
    e.preventDefault();
    const randomFolio = 'MUD-' + Math.floor(1000 + Math.random() * 9000);
    await addDoc(collection(db, "moves"), { ...newMove, folio: randomFolio, status: 'Programada', items: [], price: 0, createdAt: new Date() });
    setIsCreateModalOpen(false); setNewMove({ client: '', phone: '', origin: '', destination: '', date: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-2 text-cadena-pink font-black text-xl tracking-tight">
          <LayoutDashboard className="text-cadena-blue" /> Panel Cadena
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 font-medium text-sm flex gap-2 transition"><LogOut size={18} /> Salir</button>
      </nav>

      <div className="bg-white px-4 sm:px-8 shadow-sm relative z-10">
        <div className="flex space-x-8 overflow-x-auto">
          <TabButton label="Cotizaciones Nuevas" icon={<FileText size={18}/>} active={activeTab === 'cotizaciones'} onClick={() => setActiveTab('cotizaciones')} count={pendingMoves.length} />
          <TabButton label="Operaciones Activas" icon={<Truck size={18}/>} active={activeTab === 'operaciones'} onClick={() => setActiveTab('operaciones')} count={activeMoves.length} />
          <TabButton label="Historial Finalizado" icon={<CheckCircle size={18}/>} active={activeTab === 'historial'} onClick={() => setActiveTab('historial')} count={finishedMoves.length} />
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PESTAÑA 1: COTIZACIONES */}
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

        {/* PESTAÑA 2: OPERACIONES */}
        {activeTab === 'operaciones' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-700">Operaciones Activas</h2>
              <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex gap-2 font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5">
                <PlusCircle size={20} /> Crear Manual
              </button>
            </div>
            {activeMoves.length === 0 ? <EmptyState msg="Sin operaciones activas." /> : (
              <div className="grid gap-4">
                {activeMoves.map(move => (
                  <MoveCard 
                    key={move.id} 
                    move={move} 
                    onEdit={() => setEditingMove(move)} 
                    onCopyLink={() => copyContractLink(move.id)} 
                    onDelete={() => handleDelete(move.id)} 
                    onViewId={() => setViewingId(move)} 
                    onPrintOrder={() => handlePrintOrder(move)} // <--- PASAMOS LA FUNCIÓN
                  />
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
                  <MoveCard 
                    key={move.id} 
                    move={move} 
                    onEdit={() => setEditingMove(move)} 
                    onCopyLink={() => copyContractLink(move.id)} 
                    onDelete={() => handleDelete(move.id)} 
                    onViewId={() => setViewingId(move)}
                    onPrintOrder={() => handlePrintOrder(move)} // <--- AQUÍ TAMBIÉN
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {editingMove && (
        <Modal title={`Editor de Servicio: ${editingMove.folio}`} onClose={() => setEditingMove(null)}>
          <form onSubmit={handleUpdateMove} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <div><label className="lbl">Nombre Cliente</label><input className="inp" value={editingMove.client} onChange={e => setEditingMove({...editingMove, client: e.target.value})} /></div>
              <div><label className="lbl">WhatsApp</label><input className="inp" value={editingMove.phone} onChange={e => setEditingMove({...editingMove, phone: e.target.value})} /></div>
              <div><label className="lbl text-cadena-blue">Precio Final ($)</label><input type="number" className="inp border-cadena-blue border-2 font-bold text-lg" value={editingMove.price || ''} onChange={e => setEditingMove({...editingMove, price: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-4">
              <div><label className="lbl">Dirección Origen</label><input className="inp" value={editingMove.origin} onChange={e => setEditingMove({...editingMove, origin: e.target.value})} /></div>
              <div><label className="lbl">Dirección Destino</label><input className="inp" value={editingMove.destination} onChange={e => setEditingMove({...editingMove, destination: e.target.value})} /></div>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <label className="lbl mb-2">Inventario de Artículos</label>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                {editingMove.items && editingMove.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
                    <span className="text-gray-700"><strong>{item.quantity}</strong> {item.name}</span>
                    <button type="button" onClick={() => removeItem(index)} className="text-red-300 hover:text-red-500 transition"><X size={18}/></button>
                  </div>
                ))}
                <div className="flex gap-2 mt-4 pt-2 border-t border-gray-200">
                  <input type="number" className="w-20 p-2 border rounded-lg text-sm outline-none focus:border-cadena-pink" placeholder="Cant." value={tempItem.quantity} onChange={e => setTempItem({...tempItem, quantity: Number(e.target.value)})} />
                  <input type="text" className="flex-1 p-2 border rounded-lg text-sm outline-none focus:border-cadena-pink" placeholder="Nuevo artículo..." value={tempItem.name} onChange={e => setTempItem({...tempItem, name: e.target.value})} />
                  <button type="button" onClick={addItem} className="bg-cadena-blue text-white p-2 rounded-lg hover:bg-blue-700 transition"><Plus size={18}/></button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="lbl">Notas / Observaciones</label><textarea className="inp h-24 resize-none" value={editingMove.notes || ''} onChange={e => setEditingMove({...editingMove, notes: e.target.value})} placeholder="Piso 3, escaleras estrechas, etc." /></div>
              <div className="space-y-4">
                <div><label className="lbl">Estado del Proceso</label><select className="inp cursor-pointer" value={editingMove.status} onChange={e => setEditingMove({...editingMove, status: e.target.value})}><option value="Pendiente">Pendiente (Sin Autorizar)</option><option value="Programada">Programada (Autorizado)</option><option value="Contrato Firmado">Contrato Firmado</option><option value="En Carga">En Carga</option><option value="En Tránsito">En Tránsito</option><option value="Finalizada">Finalizada</option></select></div>
                {editingMove.idUrl && <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2 text-green-700 text-xs font-bold"><CreditCard size={14}/> Identificación Recibida</div>}
              </div>
            </div>
            <button className="w-full bg-cadena-pink hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition flex justify-center gap-2 items-center text-lg">
              <Save size={20}/> Guardar Cambios y Actualizar
            </button>
          </form>
        </Modal>
      )}

      {viewingId && (
        <Modal title={`ID: ${viewingId.client}`} onClose={() => setViewingId(null)}>
          {viewingId.idUrl ? <img src={viewingId.idUrl} className="w-full object-contain bg-black rounded" /> : <p className="text-center py-10 text-gray-400">Sin identificación.</p>}
        </Modal>
      )}

      {isCreateModalOpen && (
        <Modal title="Nueva Mudanza Manual" onClose={() => setIsCreateModalOpen(false)}>
          <form onSubmit={handleCreateMove} className="space-y-4">
            <input className="inp" placeholder="Nombre del Cliente" value={newMove.client} onChange={e => setNewMove({...newMove, client: e.target.value})} required/>
            <div className="grid grid-cols-2 gap-3">
              <input className="inp" placeholder="Origen" value={newMove.origin} onChange={e => setNewMove({...newMove, origin: e.target.value})} />
              <input className="inp" placeholder="Destino" value={newMove.destination} onChange={e => setNewMove({...newMove, destination: e.target.value})} />
            </div>
            <button className="w-full bg-cadena-pink hover:bg-pink-600 text-white font-bold py-3 rounded-xl shadow-md transition mt-2">
              Crear Registro
            </button>
          </form>
        </Modal>
      )}
      
    </div>
  );
};

// COMPONENTES AUX
const TabButton = ({ label, icon, active, onClick, count }) => (
  <button onClick={onClick} className={`flex items-center gap-2 py-4 border-b-4 font-bold transition whitespace-nowrap px-4 ${active ? 'border-cadena-pink text-cadena-pink' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
    {icon} {label} 
    {count > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-pink-100 text-cadena-pink' : 'bg-gray-100 text-gray-500'}`}>{count}</span>}
  </button>
);

const EmptyState = ({ msg }) => (<div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100"><p className="text-gray-400 font-medium">{msg}</p></div>);
const Modal = ({ title, onClose, children }) => (<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"><div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[95vh] overflow-y-auto"><div className="bg-white p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10"><h3 className="font-bold text-xl text-gray-800">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"><X size={20}/></button></div><div className="p-8">{children}</div></div></div>);

// --- TARJETA DE MUDANZA ACTUALIZADA (CON BOTÓN DE IMPRIMIR) ---
const MoveCard = ({ move, onEdit, onDelete, onCopyLink, onViewId, onPrintOrder, isPending }) => {
  const hasItems = Array.isArray(move.items) && move.items.length > 0;
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between gap-6 hover:shadow-lg transition-all duration-300 ${isPending ? 'border-l-[6px] border-l-cadena-pink border-t border-r border-b border-gray-100' : 'border border-gray-100'}`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs font-bold font-mono tracking-wider">{move.folio}</span>
          <h3 className="font-bold text-xl text-gray-800">{move.client}</h3>
          {move.phone && <a href={`https://wa.me/${move.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-green-500 bg-green-50 p-1.5 rounded-full hover:bg-green-100 transition"><MessageCircle size={18} /></a>}
        </div>
        <div className="text-sm text-gray-500 space-y-2 mb-4">
          <div className="flex items-center gap-2.5"><MapPin size={16} className="text-cadena-pink"/> <span className="font-medium">{move.origin}</span> <span className="text-gray-300">➜</span> <span className="font-medium">{move.destination}</span></div>
          <div className="flex items-center gap-2.5"><Truck size={16} className="text-gray-400"/> {hasItems ? `${move.items.length} Artículos registrados` : 'Sin lista de inventario'}</div>
        </div>
        {hasItems && <div className="flex flex-wrap gap-2 mb-3">{move.items.slice(0, 5).map((it, i) => <span key={i} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100 font-medium"><strong>{it.quantity}</strong> {it.name}</span>)}{move.items.length > 5 && <span className="text-[10px] text-gray-400 pt-1">+{move.items.length - 5} más...</span>}</div>}
        {move.notes && <div className="mt-3 text-sm bg-yellow-50 text-yellow-700 p-3 rounded-xl border border-yellow-100 flex gap-2 items-start"><StickyNote size={16} className="shrink-0 mt-0.5" /><span className="italic">{move.notes}</span></div>}
      </div>
      <div className="flex flex-col items-end justify-between min-w-[140px] border-l border-gray-50 pl-6 md:border-l-0 md:pl-0">
        <div className="text-right">
          {move.price > 0 ? <p className="text-2xl font-black text-cadena-dark">${move.price.toLocaleString()}</p> : <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold uppercase tracking-wide">Por Cotizar</span>}
          {!isPending && <div className={`mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white ${move.status === 'Contrato Firmado' ? 'bg-purple-500' : (move.status === 'Finalizada' ? 'bg-green-500' : 'bg-cadena-blue')}`}>{move.status}</div>}
        </div>
        <div className="flex gap-2 mt-4">
          {onPrintOrder && (
            <button onClick={onPrintOrder} title="Imprimir Orden de Carga" className="p-2.5 text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition"><Printer size={20}/></button>
          )}
          <button onClick={onViewId} title="Ver INE" className={`p-2.5 rounded-xl transition ${move.idUrl ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-300 bg-gray-50'}`}><CreditCard size={20}/></button>
          <button onClick={onEdit} title="Editar" className="p-2.5 text-white bg-cadena-blue rounded-xl shadow-md hover:bg-blue-700 transition hover:-translate-y-0.5"><Edit3 size={20}/></button>
          {onCopyLink && <button onClick={onCopyLink} title="Copiar Contrato" className="p-2.5 text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition"><ClipboardList size={20}/></button>}
          <button onClick={onDelete} title="Eliminar" className="p-2.5 text-red-400 bg-red-50 rounded-xl hover:bg-red-100 transition"><Trash2 size={20}/></button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;