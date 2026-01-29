import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { 
  LogOut, PlusCircle, LayoutDashboard, MapPin, Truck, Phone, MessageCircle, 
  Trash2, Edit3, X, ClipboardList, Save, FileText, StickyNote, CreditCard, Plus, CheckCircle, Printer, Calculator
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cotizaciones');
  const [moves, setMoves] = useState([]);
  
  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMove, setEditingMove] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  // Estados formularios
  const [newMove, setNewMove] = useState({ client: '', phone: '', origin: '', destination: '', date: '' });
  const [tempItem, setTempItem] = useState({ name: '', quantity: 1 });

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
    // TRUCO: Usamos href y cortamos antes del # para obtener la ruta completa del repo
    // Esto obtiene: "https://usuario.github.io/mudanzas-cadena/" completo
    const baseUrl = window.location.href.split('#')[0];
    
    // Ahora sí armamos el link correcto
    const url = `${baseUrl}#/contrato/${id}`;
    
    navigator.clipboard.writeText(url); 
    alert("Enlace del contrato copiado correctamente."); 
  };

  // --- FUNCIÓN: GENERAR ORDEN DE CARGA (PDF) ---
  const handlePrintOrder = (move) => {
    // Nota: Aquí podrías actualizar el HTML para usar move.financialItems si quieres que salgan los costos desglosados en la orden de carga también.
    // Por ahora mantengo la lógica simple de inventario.
    const printWindow = window.open('', '_blank');
    const itemsList = move.items && move.items.length > 0 
      ? move.items.map(item => `<tr><td style="padding:8px; border-bottom:1px solid #eee;">${item.quantity}</td><td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td></tr>`).join('')
      : '<tr><td colspan="2" style="padding:10px; text-align:center; color:#999;">Sin inventario registrado</td></tr>';

    const htmlContent = `
      <html>
        <head><title>Orden ${move.folio}</title></head>
        <body style="font-family:Arial; padding:40px;">
          <h1>Orden de Carga: ${move.folio}</h1>
          <p><strong>Cliente:</strong> ${move.client}</p>
          <p><strong>Origen:</strong> ${move.origin}</p>
          <p><strong>Destino:</strong> ${move.destination}</p>
          <h3>Inventario</h3>
          <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="background:#eee;"><th style="text-align:left; padding:8px;">Cant</th><th style="text-align:left; padding:8px;">Artículo</th></tr></thead>
            <tbody>${itemsList}</tbody>
          </table>
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

  // --- LÓGICA DE CONCEPTOS FINANCIEROS (NUEVO) ---
  
  // Agregar una fila vacía
  const addFinancialConcept = () => {
    const currentConcepts = editingMove.financialItems || [];
    setEditingMove({
      ...editingMove,
      financialItems: [...currentConcepts, { description: '', cost: 0, quantity: 1 }]
    });
  };

  // Eliminar fila
  const removeFinancialConcept = (index) => {
    const currentConcepts = [...(editingMove.financialItems || [])];
    currentConcepts.splice(index, 1);
    setEditingMove({ ...editingMove, financialItems: currentConcepts });
  };

  // Editar fila
  const updateFinancialConcept = (index, field, value) => {
    const currentConcepts = [...(editingMove.financialItems || [])];
    currentConcepts[index][field] = value;
    setEditingMove({ ...editingMove, financialItems: currentConcepts });
  };

  // CALCULAR TOTALES (Suma de filas + Impuestos)
  const calculateTotals = () => {
    const items = editingMove.financialItems || [];
    
    // 1. Sumar (Costo * Cantidad) de todas las filas
    const subtotal = items.reduce((acc, item) => acc + (Number(item.cost) * Number(item.quantity)), 0);
    
    // 2. Impuestos
    const iva = subtotal * 0.16;
    const retention = subtotal * 0.04;
    const total = subtotal + iva - retention;
    
    setEditingMove({
      ...editingMove,
      subtotal: subtotal.toFixed(2),
      iva: iva.toFixed(2),
      retention: retention.toFixed(2),
      price: total.toFixed(2)
    });
  };

  const handleUpdateMove = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "moves", editingMove.id), {
        client: editingMove.client,
        phone: editingMove.phone,
        origin: editingMove.origin,
        destination: editingMove.destination,
        date: editingMove.date,
        
        // Guardamos la lista de conceptos financieros
        financialItems: editingMove.financialItems || [],
        subtotal: Number(editingMove.subtotal) || 0,
        iva: Number(editingMove.iva) || 0,
        retention: Number(editingMove.retention) || 0,
        price: Number(editingMove.price),
        
        status: editingMove.status,
        
        // --- AQUÍ ESTÁ EL ARREGLO ---
        // Si editingMove.notes es undefined, enviamos un string vacío
        notes: editingMove.notes || '', 
        
        // También es buena práctica proteger el array de items
        items: editingMove.items || []
      });
      setEditingMove(null);
      alert("Servicio actualizado correctamente.");
    } catch (error) { 
        console.error("Error al actualizar:", error); 
        alert("Error al actualizar: " + error.message);
    }
  };

  const handleCreateMove = async (e) => {
    e.preventDefault();
    const randomFolio = 'MUD-' + Math.floor(1000 + Math.random() * 9000);
    
    // Conceptos por defecto al crear
    const defaultFinancials = [
      { description: "SERVICIO DE FLETE EXCLUSIVO UNIDAD 3.5 TON...", cost: 0, quantity: 1 },
      { description: "MANIOBRA DE CARGA Y DESCARGA", cost: 0, quantity: 1 }
    ];

    await addDoc(collection(db, "moves"), { 
      ...newMove, folio: randomFolio, status: 'Pendiente', items: [], 
      price: 0, subtotal: 0, iva: 0, retention: 0,
      financialItems: defaultFinancials, // Inicializamos con 2 filas
      createdAt: new Date() 
    });
    setIsCreateModalOpen(false); setNewMove({ client: '', phone: '', origin: '', destination: '', date: '' });
  };

  // Estilos
  const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue focus:bg-white transition text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1.5";

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
          <TabButton label="Solicitudes Nuevas" icon={<FileText size={18}/>} active={activeTab === 'cotizaciones'} onClick={() => setActiveTab('cotizaciones')} count={pendingMoves.length} />
          <TabButton label="Operaciones Activas" icon={<Truck size={18}/>} active={activeTab === 'operaciones'} onClick={() => setActiveTab('operaciones')} count={activeMoves.length} />
          <TabButton label="Historial Finalizado" icon={<CheckCircle size={18}/>} active={activeTab === 'historial'} onClick={() => setActiveTab('historial')} count={finishedMoves.length} />
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PESTAÑA 1 */}
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

        {/* PESTAÑA 2 */}
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
                  <MoveCard key={move.id} move={move} onEdit={() => setEditingMove(move)} onCopyLink={() => copyContractLink(move.id)} onDelete={() => handleDelete(move.id)} onViewId={() => setViewingId(move)} onPrintOrder={() => handlePrintOrder(move)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3 */}
        {activeTab === 'historial' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-700">Historial de Servicios</h2>
            {finishedMoves.length === 0 ? <EmptyState msg="Aún no hay mudanzas finalizadas." /> : (
              <div className="grid gap-4 opacity-80 hover:opacity-100 transition duration-300">
                {finishedMoves.map(move => (
                  <MoveCard key={move.id} move={move} onEdit={() => setEditingMove(move)} onCopyLink={() => copyContractLink(move.id)} onDelete={() => handleDelete(move.id)} onViewId={() => setViewingId(move)} onPrintOrder={() => handlePrintOrder(move)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {editingMove && (
        <Modal title={`Editor de Servicio: ${editingMove.folio}`} onClose={() => setEditingMove(null)}>
          <form onSubmit={handleUpdateMove} className="space-y-8">
            
            {/* SECCIÓN 1: DATOS GENERALES */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Datos Generales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Nombre Cliente</label>
                    <input className={inputClass} value={editingMove.client} onChange={e => setEditingMove({...editingMove, client: e.target.value})} />
                </div>
                <div>
                    <label className={labelClass}>WhatsApp</label>
                    <input className={inputClass} value={editingMove.phone} onChange={e => setEditingMove({...editingMove, phone: e.target.value})} />
                </div>
                <div>
                    <label className={labelClass}>Fecha Tentativa</label>
                    <input type="date" className={inputClass} value={editingMove.date} onChange={e => setEditingMove({...editingMove, date: e.target.value})} />
                </div>
                <div>
                    <label className={labelClass}>Estado Actual</label>
                    <select className={`${inputClass} cursor-pointer font-bold text-cadena-blue`} value={editingMove.status} onChange={e => setEditingMove({...editingMove, status: e.target.value})}>
                        <option value="Pendiente">Pendiente (Docs)</option>
                        <option value="Programada">Programada (Autorizado)</option>
                        <option value="Contrato Firmado">Contrato Firmado</option>
                        <option value="En Carga">En Carga</option>
                        <option value="En Tránsito">En Tránsito</option>
                        <option value="Finalizada">Finalizada</option>
                    </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: RUTA */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Ruta Logística</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className={labelClass}>Dirección Origen</label>
                    <textarea className={`${inputClass} h-24`} value={editingMove.origin} onChange={e => setEditingMove({...editingMove, origin: e.target.value})} />
                 </div>
                 <div>
                    <label className={labelClass}>Dirección Destino</label>
                    <textarea className={`${inputClass} h-24`} value={editingMove.destination} onChange={e => setEditingMove({...editingMove, destination: e.target.value})} />
                 </div>
              </div>
            </div>

            {/* SECCIÓN 3: FINANZAS (TABLA DINÁMICA MEJORADA) */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center mb-4 text-cadena-blue">
                <div className="flex items-center gap-2">
                   <Calculator size={20} />
                   <h3 className="text-sm font-black uppercase tracking-widest">Desglose Financiero</h3>
                </div>
                <button type="button" onClick={addFinancialConcept} className="text-xs bg-white border border-cadena-blue px-3 py-1 rounded-full hover:bg-blue-100 transition">
                   + Agregar Fila
                </button>
              </div>
              
              {/* Encabezados de Tabla */}
              <div className="grid grid-cols-12 gap-2 mb-2 px-2 text-[10px] font-bold text-gray-400 uppercase">
                 <div className="col-span-6">Concepto / Descripción</div>
                 <div className="col-span-2 text-center">Costo U.</div>
                 <div className="col-span-2 text-center">Cant.</div>
                 <div className="col-span-2 text-center">Acción</div>
              </div>

              {/* Lista de Filas Dinámicas */}
              <div className="space-y-2 mb-6">
                 {editingMove.financialItems && editingMove.financialItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                       <div className="col-span-6">
                          <textarea 
                             className={`${inputClass} h-16 text-xs py-2`} 
                             placeholder="Descripción del servicio..."
                             value={item.description} 
                             onChange={(e) => updateFinancialConcept(index, 'description', e.target.value)}
                          />
                       </div>
                       <div className="col-span-2">
                          <input 
                             type="number" 
                             className={`${inputClass} text-center`} 
                             placeholder="$0"
                             value={item.cost} 
                             onChange={(e) => updateFinancialConcept(index, 'cost', e.target.value)}
                          />
                       </div>
                       <div className="col-span-2">
                          <input 
                             type="number" 
                             className={`${inputClass} text-center`} 
                             placeholder="1"
                             value={item.quantity} 
                             onChange={(e) => updateFinancialConcept(index, 'quantity', e.target.value)}
                          />
                       </div>
                       <div className="col-span-2 flex items-center justify-center h-full">
                          <button type="button" onClick={() => removeFinancialConcept(index)} className="text-red-400 hover:text-red-600 bg-white p-2 rounded shadow-sm">
                             <Trash2 size={16}/>
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
              
              {/* Botón de Cálculo */}
              <div className="flex justify-end mb-4 border-t border-blue-100 pt-4">
                 <button type="button" onClick={calculateTotals} className="bg-cadena-dark text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-black transition shadow-md flex gap-2 items-center">
                    <Calculator size={14}/> Calcular Totales
                 </button>
              </div>

              {/* Totales */}
              <div className="flex flex-col items-end gap-2 text-sm text-gray-600">
                 <div className="flex justify-between w-48"><span>Subtotal:</span> <span className="font-bold">${Number(editingMove.subtotal || 0).toLocaleString()}</span></div>
                 <div className="flex justify-between w-48"><span>IVA (16%):</span> <span className="font-bold">${Number(editingMove.iva || 0).toLocaleString()}</span></div>
                 <div className="flex justify-between w-48 text-red-500"><span>Retención (4%):</span> <span className="font-bold">-${Number(editingMove.retention || 0).toLocaleString()}</span></div>
                 <div className="flex justify-between w-64 mt-2 pt-2 border-t border-cadena-blue items-center">
                    <span className="font-black text-cadena-blue">TOTAL FINAL:</span>
                    <input 
                       type="number" 
                       className="w-32 p-2 text-xl font-black text-cadena-blue bg-white border-2 border-cadena-blue rounded-lg text-right outline-none" 
                       value={editingMove.price || ''} 
                       onChange={e => setEditingMove({...editingMove, price: e.target.value})} 
                    />
                 </div>
              </div>
            </div>

            {/* SECCIÓN 4: INVENTARIO */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Inventario</h3>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100 max-h-48 overflow-y-auto mb-4">
                {editingMove.items && editingMove.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
                    <span className="text-gray-700"><strong>{item.quantity}</strong> {item.name}</span>
                    <button type="button" onClick={() => removeItem(index)} className="text-red-300 hover:text-red-500 transition"><X size={18}/></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                  <input type="number" className="w-24 p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-cadena-pink" placeholder="Cant." value={tempItem.quantity} onChange={e => setTempItem({...tempItem, quantity: Number(e.target.value)})} />
                  <input type="text" className="flex-1 p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-cadena-pink" placeholder="Nuevo artículo..." value={tempItem.name} onChange={e => setTempItem({...tempItem, name: e.target.value})} />
                  <button type="button" onClick={addItem} className="bg-cadena-blue text-white px-4 rounded-lg hover:bg-blue-700 transition"><Plus size={20}/></button>
              </div>
            </div>

            {/* NOTAS Y EXTRAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className={labelClass}>Notas / Observaciones</label>
                  <textarea className={`${inputClass} h-24 resize-none`} value={editingMove.notes || ''} onChange={e => setEditingMove({...editingMove, notes: e.target.value})} placeholder="Piso 3, escaleras estrechas, etc." />
              </div>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                 <p className="text-xs font-bold text-gray-400 uppercase">Documentos Recibidos:</p>
                 <div className="flex gap-2">
                    {editingMove.idUrl ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> INE</span> : <span className="bg-gray-200 text-gray-400 px-3 py-1 rounded-full text-xs">Sin INE</span>}
                    {editingMove.addressUrl ? <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Domicilio</span> : <span className="bg-gray-200 text-gray-400 px-3 py-1 rounded-full text-xs">Sin Domicilio</span>}
                 </div>
              </div>
            </div>

            <button className="w-full bg-cadena-pink hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition flex justify-center gap-2 items-center text-lg mt-4">
              <Save size={20}/> Guardar Cambios y Actualizar
            </button>
          </form>
        </Modal>
      )}

      {/* MODAL VER DOCUMENTOS */}
      {viewingId && (
        <Modal title={`Documentación: ${viewingId.client}`} onClose={() => setViewingId(null)}>
           <div className="grid grid-cols-1 gap-8">
              <div>
                <p className="font-black text-gray-400 mb-3 uppercase text-xs tracking-widest border-b pb-1">Identificación (INE):</p>
                {viewingId.idUrl ? <img src={viewingId.idUrl} className="w-full rounded-xl border shadow-sm" /> : <p className="text-gray-400 italic text-sm py-4 text-center bg-gray-50 rounded">No adjuntado</p>}
              </div>
              <div>
                <p className="font-black text-gray-400 mb-3 uppercase text-xs tracking-widest border-b pb-1">Comprobante de Domicilio:</p>
                {viewingId.addressUrl ? <img src={viewingId.addressUrl} className="w-full rounded-xl border shadow-sm" /> : <p className="text-gray-400 italic text-sm py-4 text-center bg-gray-50 rounded">No adjuntado</p>}
              </div>
           </div>
        </Modal>
      )}

      {isCreateModalOpen && (
        <Modal title="Nueva Mudanza Manual" onClose={() => setIsCreateModalOpen(false)}>
          <form onSubmit={handleCreateMove} className="space-y-6">
            <div>
                <label className={labelClass}>Nombre del Cliente</label>
                <input className={inputClass} placeholder="Ej. Juan Pérez" value={newMove.client} onChange={e => setNewMove({...newMove, client: e.target.value})} required/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className={labelClass}>Origen</label>
                  <input className={inputClass} placeholder="Colonia / Ciudad" value={newMove.origin} onChange={e => setNewMove({...newMove, origin: e.target.value})} />
              </div>
              <div>
                  <label className={labelClass}>Destino</label>
                  <input className={inputClass} placeholder="Colonia / Ciudad" value={newMove.destination} onChange={e => setNewMove({...newMove, destination: e.target.value})} />
              </div>
            </div>
            <button className="w-full bg-cadena-pink hover:bg-pink-600 text-white font-bold py-3 rounded-xl shadow-md transition">
              Crear Registro
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Componentes Auxiliares
const TabButton = ({ label, icon, active, onClick, count }) => (
  <button onClick={onClick} className={`flex items-center gap-2 py-4 border-b-4 font-bold transition whitespace-nowrap px-4 ${active ? 'border-cadena-pink text-cadena-pink' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
    {icon} {label} 
    {count > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-pink-100 text-cadena-pink' : 'bg-gray-100 text-gray-500'}`}>{count}</span>}
  </button>
);
const EmptyState = ({ msg }) => (<div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100"><p className="text-gray-400 font-medium">{msg}</p></div>);
const Modal = ({ title, onClose, children }) => (<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"><div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[95vh] overflow-y-auto"><div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 shadow-sm"><h3 className="font-bold text-xl text-gray-800">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"><X size={20}/></button></div><div className="p-8">{children}</div></div></div>);

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
          <div className="flex items-center gap-2.5"><MapPin size={16} className="text-cadena-pink"/> <span className="font-medium truncate max-w-xs">{move.origin}</span></div>
          <div className="flex items-center gap-2.5"><Truck size={16} className="text-gray-400"/> {hasItems ? `${move.items.length} Artículos registrados` : 'Sin lista de inventario'}</div>
        </div>
        <div className="flex gap-2">
            {move.idUrl && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">INE OK</span>}
            {move.addressUrl && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">DOM OK</span>}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between min-w-[140px] border-l border-gray-50 pl-6 md:border-l-0 md:pl-0">
        <div className="text-right">
          {move.price > 0 ? <p className="text-2xl font-black text-cadena-dark">${move.price.toLocaleString()}</p> : <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold uppercase tracking-wide">Por Cotizar</span>}
          <div className={`mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white ${move.status === 'Contrato Firmado' ? 'bg-purple-500' : 'bg-cadena-blue'}`}>{move.status}</div>
        </div>
        <div className="flex gap-2 mt-4">
          {onPrintOrder && <button onClick={onPrintOrder} className="p-2.5 text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition"><Printer size={20}/></button>}
          <button onClick={onViewId} className="p-2.5 text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition"><CreditCard size={20}/></button>
          <button onClick={onEdit} className="p-2.5 text-white bg-cadena-blue rounded-xl shadow-md hover:bg-blue-700 transition hover:-translate-y-0.5"><Edit3 size={20}/></button>
          {onCopyLink && <button onClick={onCopyLink} className="p-2.5 text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition"><ClipboardList size={20}/></button>}
          <button onClick={onDelete} className="p-2.5 text-red-400 bg-red-50 rounded-xl hover:bg-red-100 transition"><Trash2 size={20}/></button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;