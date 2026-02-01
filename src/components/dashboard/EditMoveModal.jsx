import { useState, useEffect } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Calculator, Trash2, X, Plus, Save, CheckCircle, Package, Receipt,
  // Iconos del inventario
  Box, Sofa, Table2, Bed, Refrigerator, WashingMachine, Tv, Monitor, 
  Bike, CarFront, Frame, Music2, Archive, Container
} from 'lucide-react';

// --- CATÁLOGO DE MUEBLES ---
const FURNITURE_ITEMS = [
  { id: 'caja_ch', label: 'Caja Chica', icon: <Box size={18} /> },
  { id: 'caja_gd', label: 'Caja Grande', icon: <Box size={22} /> },
  { id: 'sala', label: 'Sillón / Sala', icon: <Sofa size={20} /> },
  { id: 'comedor', label: 'Mesa Comedor', icon: <Table2 size={20} /> },
  { id: 'cama_ind', label: 'Cama Indiv.', icon: <Bed size={18} /> },
  { id: 'cama_mat', label: 'Cama Matrim.', icon: <Bed size={20} /> },
  { id: 'cama_ks', label: 'Cama King Size', icon: <Bed size={22} /> },
  { id: 'refri', label: 'Refrigerador', icon: <Refrigerator size={20} /> },
  { id: 'lavadora', label: 'Lavadora/Sec', icon: <WashingMachine size={20} /> },
  { id: 'tv', label: 'TV / Pantalla', icon: <Tv size={20} /> },
  { id: 'escritorio', label: 'Escritorio/Office', icon: <Monitor size={20} /> },
  { id: 'bici', label: 'Bicicleta', icon: <Bike size={20} /> },
  { id: 'moto', label: 'Motocicleta', icon: <Bike size={22} className="text-slate-800" /> },
  { id: 'auto', label: 'Automóvil', icon: <CarFront size={22} /> },
  { id: 'arte', label: 'Obra de Arte', icon: <Frame size={20} /> },
  { id: 'piano', label: 'Piano', icon: <Music2 size={20} /> },
  { id: 'fuerte', label: 'Caja Fuerte', icon: <Archive size={20} /> },
  { id: 'pallet', label: 'Pallet / Carga', icon: <Container size={20} /> },
];

const Modal = ({ title, onClose, children }) => (<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"><div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[95vh] overflow-y-auto"><div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 shadow-sm"><h3 className="font-bold text-xl text-gray-800">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"><X size={20}/></button></div><div className="p-8">{children}</div></div></div>);

const EditMoveModal = ({ moveData, onClose, onSuccess }) => {
  // Inicializamos taxType con 'retention' por defecto si no existe (para compatibilidad)
  const [editingMove, setEditingMove] = useState({
    ...moveData,
    taxType: moveData.taxType || 'retention' 
  });
  const [tempItem, setTempItem] = useState({ name: '', quantity: 1 });

  useEffect(() => { 
    setEditingMove({
        ...moveData,
        taxType: moveData.taxType || 'retention'
    }); 
  }, [moveData]);

  // --- LÓGICA DE INVENTARIO ---
  const addFromCatalog = (itemLabel) => {
    const currentItems = [...(editingMove.items || [])];
    const existingIndex = currentItems.findIndex(i => i.name === itemLabel);
    if (existingIndex >= 0) {
      currentItems[existingIndex].quantity = Number(currentItems[existingIndex].quantity) + 1;
    } else {
      currentItems.push({ name: itemLabel, quantity: 1 });
    }
    setEditingMove({ ...editingMove, items: currentItems });
  };

  const addManualItem = () => {
    if (!tempItem.name) return;
    const currentItems = [...(editingMove.items || [])];
    const existingIndex = currentItems.findIndex(i => i.name.toLowerCase() === tempItem.name.toLowerCase());
    if (existingIndex >= 0) {
        currentItems[existingIndex].quantity = Number(currentItems[existingIndex].quantity) + Number(tempItem.quantity);
    } else {
        currentItems.push({ ...tempItem });
    }
    setEditingMove({ ...editingMove, items: currentItems });
    setTempItem({ name: '', quantity: 1 });
  };

  const removeItem = (index) => {
    const newItems = [...editingMove.items];
    newItems.splice(index, 1);
    setEditingMove({ ...editingMove, items: newItems });
  };

  const updateItemQuantity = (index, newQty) => {
    const newItems = [...editingMove.items];
    newItems[index].quantity = Number(newQty);
    setEditingMove({ ...editingMove, items: newItems });
  };

  // --- LÓGICA FINANCIERA ---
  const addFinancialConcept = () => {
    const currentConcepts = editingMove.financialItems || [];
    setEditingMove({
      ...editingMove,
      financialItems: [...currentConcepts, { description: '', cost: 0, quantity: 1 }]
    });
  };

  const removeFinancialConcept = (index) => {
    const currentConcepts = [...(editingMove.financialItems || [])];
    currentConcepts.splice(index, 1);
    setEditingMove({ ...editingMove, financialItems: currentConcepts });
  };

  const updateFinancialConcept = (index, field, value) => {
    const currentConcepts = [...(editingMove.financialItems || [])];
    currentConcepts[index][field] = value;
    setEditingMove({ ...editingMove, financialItems: currentConcepts });
  };

  // --- NUEVA LÓGICA DE CÁLCULO CON IMPUESTOS DINÁMICOS ---
  const calculateTotals = () => {
    const items = editingMove.financialItems || [];
    const subtotal = items.reduce((acc, item) => acc + (Number(item.cost) * Number(item.quantity)), 0);
    
    let iva = 0;
    let retention = 0;

    // Calculamos según la opción seleccionada
    switch (editingMove.taxType) {
        case 'iva': // Solo IVA
            iva = subtotal * 0.16;
            retention = 0;
            break;
        case 'retention': // IVA + Retención (Empresas)
            iva = subtotal * 0.16;
            retention = subtotal * 0.04;
            break;
        case 'none': // Sin impuestos
        default:
            iva = 0;
            retention = 0;
            break;
    }

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
        ...editingMove,
        taxType: editingMove.taxType || 'retention', // Guardamos la preferencia
        notes: editingMove.notes || '',
        items: editingMove.items || []
      });
      alert("Servicio actualizado correctamente.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) { 
        console.error("Error al actualizar:", error); 
        alert("Error: " + error.message);
    }
  };

  const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue focus:bg-white transition text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1.5";

  return (
    <Modal title={`Editor de Servicio: ${editingMove.folio}`} onClose={onClose}>
      <form onSubmit={handleUpdateMove} className="space-y-8">
        
        {/* 1. DATOS GENERALES */}
        <div className="border-b border-gray-100 pb-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Datos Generales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={labelClass}>Nombre Cliente</label><input className={inputClass} value={editingMove.client} onChange={e => setEditingMove({...editingMove, client: e.target.value})} /></div>
            <div><label className={labelClass}>WhatsApp</label><input className={inputClass} value={editingMove.phone} onChange={e => setEditingMove({...editingMove, phone: e.target.value})} /></div>
            <div><label className={labelClass}>Fecha Tentativa</label><input type="date" className={inputClass} value={editingMove.date} onChange={e => setEditingMove({...editingMove, date: e.target.value})} /></div>
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

        {/* 2. RUTA */}
        <div className="border-b border-gray-100 pb-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Ruta Logística</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className={labelClass}>Dirección Origen</label><textarea className={`${inputClass} h-24`} value={editingMove.origin} onChange={e => setEditingMove({...editingMove, origin: e.target.value})} /></div>
             <div><label className={labelClass}>Dirección Destino</label><textarea className={`${inputClass} h-24`} value={editingMove.destination} onChange={e => setEditingMove({...editingMove, destination: e.target.value})} /></div>
          </div>
        </div>

        {/* 3. INVENTARIO */}
        <div className="border-b border-gray-100 pb-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Package size={18}/> Inventario
          </h3>
          
          {/* A. CATÁLOGO VISUAL */}
          <div className="mb-6">
             <p className="text-xs font-bold text-gray-400 mb-2">AGREGAR RÁPIDO (Click para sumar):</p>
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {FURNITURE_ITEMS.map((item) => (
                   <button 
                      key={item.id} 
                      type="button"
                      onClick={() => addFromCatalog(item.label)}
                      className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-200 hover:border-cadena-blue hover:bg-blue-50 transition text-gray-500 hover:text-cadena-blue group bg-white"
                   >
                      <div className="mb-1 group-hover:scale-110 transition-transform">{item.icon}</div>
                      <span className="text-[9px] font-bold text-center leading-tight">{item.label}</span>
                   </button>
                ))}
             </div>
          </div>

          {/* B. LISTA DE ITEMS */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100 max-h-60 overflow-y-auto mb-4">
            {editingMove.items && editingMove.items.length > 0 ? (
               editingMove.items.map((item, index) => (
               <div key={index} className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-sm">
                  <input 
                     type="number" 
                     className="w-16 p-1 border border-gray-200 rounded text-center font-bold outline-none focus:border-cadena-blue"
                     value={item.quantity}
                     onChange={(e) => updateItemQuantity(index, e.target.value)}
                  />
                  <span className="flex-1 font-medium text-gray-700">{item.name}</span>
                  <button type="button" onClick={() => removeItem(index)} className="text-red-300 hover:text-red-500 transition p-1"><Trash2 size={16}/></button>
               </div>
               ))
            ) : (
               <p className="text-center text-gray-400 text-xs py-4">Inventario vacío</p>
            )}
          </div>

          {/* C. AGREGAR MANUAL */}
          <div className="flex gap-3 bg-white p-3 rounded-xl border border-gray-200 items-center">
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap">OTRO:</span>
              <input type="number" className="w-20 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-cadena-pink" placeholder="Cant." value={tempItem.quantity} onChange={e => setTempItem({...tempItem, quantity: Number(e.target.value)})} />
              <input type="text" className="flex-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-cadena-pink" placeholder="Nombre del artículo..." value={tempItem.name} onChange={e => setTempItem({...tempItem, name: e.target.value})} />
              <button type="button" onClick={addManualItem} className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition flex items-center gap-1 text-xs font-bold"><Plus size={16}/> AGREGAR</button>
          </div>
        </div>

        {/* 4. FINANZAS (CON SELECTOR DE IMPUESTOS) */}
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
          <div className="flex justify-between items-center mb-4 text-cadena-blue">
            <div className="flex items-center gap-2"><Calculator size={20} /><h3 className="text-sm font-black uppercase tracking-widest">Desglose Financiero</h3></div>
            <button type="button" onClick={addFinancialConcept} className="text-xs bg-white border border-cadena-blue px-3 py-1 rounded-full hover:bg-blue-100 transition">+ Agregar Fila</button>
          </div>
          
          <div className="space-y-2 mb-6">
             {editingMove.financialItems && editingMove.financialItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                   <div className="col-span-6"><textarea className={`${inputClass} h-16 text-xs py-2`} placeholder="Descripción..." value={item.description} onChange={(e) => updateFinancialConcept(index, 'description', e.target.value)}/></div>
                   <div className="col-span-2"><input type="number" className={`${inputClass} text-center`} placeholder="$0" value={item.cost} onChange={(e) => updateFinancialConcept(index, 'cost', e.target.value)}/></div>
                   <div className="col-span-2"><input type="number" className={`${inputClass} text-center`} placeholder="1" value={item.quantity} onChange={(e) => updateFinancialConcept(index, 'quantity', e.target.value)}/></div>
                   <div className="col-span-2 flex items-center justify-center h-full"><button type="button" onClick={() => removeFinancialConcept(index)} className="text-red-400 hover:text-red-600 bg-white p-2 rounded shadow-sm"><Trash2 size={16}/></button></div>
                </div>
             ))}
          </div>
          
          {/* BARRA DE ACCIONES FINANCIERAS */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 border-t border-blue-100 pt-4">
             {/* Selector de Impuestos */}
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <Receipt size={18} className="text-gray-400"/>
                <select 
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-cadena-blue"
                    value={editingMove.taxType || 'retention'}
                    onChange={(e) => setEditingMove({...editingMove, taxType: e.target.value})}
                >
                    <option value="none">Sin Impuestos (Neto)</option>
                    <option value="iva">Solo IVA (16%)</option>
                    <option value="retention">IVA (16%) + Retención (-4%)</option>
                </select>
             </div>

             <button type="button" onClick={calculateTotals} className="bg-cadena-dark text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-black transition shadow-md flex gap-2 items-center w-full sm:w-auto justify-center">
                <Calculator size={14}/> Calcular Totales
             </button>
          </div>

          {/* DESGLOSE DE TOTALES */}
          <div className="flex flex-col items-end gap-2 text-sm text-gray-600">
             <div className="flex justify-between w-48"><span>Subtotal:</span> <span className="font-bold">${Number(editingMove.subtotal || 0).toLocaleString()}</span></div>
             
             {/* Mostramos IVA solo si aplica */}
             {(editingMove.taxType === 'iva' || editingMove.taxType === 'retention') && (
                <div className="flex justify-between w-48"><span>IVA (16%):</span> <span className="font-bold">${Number(editingMove.iva || 0).toLocaleString()}</span></div>
             )}
             
             {/* Mostramos Retención solo si aplica */}
             {editingMove.taxType === 'retention' && (
                <div className="flex justify-between w-48 text-red-500"><span>Retención (4%):</span> <span className="font-bold">-${Number(editingMove.retention || 0).toLocaleString()}</span></div>
             )}

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

        {/* 5. NOTAS Y DOCUMENTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className={labelClass}>Notas / Observaciones</label><textarea className={`${inputClass} h-24 resize-none`} value={editingMove.notes || ''} onChange={e => setEditingMove({...editingMove, notes: e.target.value})} placeholder="Detalles..." /></div>
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
  );
};

export default EditMoveModal;