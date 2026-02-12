import { useState, useEffect } from 'react';
import { updateDoc, doc, deleteField } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db } from '../../config/firebase';
import { 
  Calculator, Trash2, X, Plus, Save, Eye, Package, Receipt, UploadCloud, Maximize2,
  ChevronDown, ChevronUp, Sofa, BedDouble, Utensils, Tv, Briefcase, Box
} from 'lucide-react';

// --- CATÁLOGO COMPLETO ---
const FULL_CATALOG = {
  "Sala y Estancia": {
    icon: <Sofa size={18} />,
    items: [
      "Sillón 1 Plaza", "Sillón 2 Plazas", "Sillón 3 Plazas", "Sofá Cama", 
      "Sala en L (Seccional)", "Mesa de Centro", "Librero", 
      "Mueble de TV / Entretenimiento", 
      "TV Pantalla (24\" - 42\")", "TV Pantalla (43\" - 55\")", "TV Pantalla (60\" - 85\")",
      "Ventilador", "Espejo Grande", "Cuadro / Arte"
    ]
  },
  "Comedor y Cocina": {
    icon: <Utensils size={18} />,
    items: [
      "Mesa Comedor (Madera)", "Mesa Comedor (Vidrio)", "Mesa Comedor (Tubular)",
      "Sillas de Comedor (Unitario)", "Bancos / Taburetes", "Vitrina / Credenza", 
      "Refrigerador Chico (1 pta)", "Refrigerador Grande (2 ptas)", "Refrigerador Duplex", "Frigobar / Minibar",
      "Estufa", "Microondas", "Alacena"
    ]
  },
  "Recámara": {
    icon: <BedDouble size={18} />,
    items: [
      "Base+Colchón Individual", "Base+Colchón Matrimonial", "Base+Colchón Queen", "Base+Colchón King",
      "Cabecera Individual", "Cabecera Matrimonial", "Cabecera Queen", "Cabecera King",
      "Litera", "Cuna de Bebé", 
      "Buró", "Tocador / Peinador", "Ropero / Closet"
    ]
  },
  "Lavado y Baño": {
    icon: <UploadCloud size={18} />,
    items: [
      "Lavadora", "Secadora", "Centro de Lavado (Torre)", 
      "Botes / Cestos", "Mueble de Baño"
    ]
  },
  "Oficina y Electrónica": {
    icon: <Briefcase size={18} />,
    items: [
      "Escritorio", "Silla de Oficina", "Computadora / Monitor", "Impresora / Multifuncional"
    ]
  },
  "Cajas y Bultos": {
    icon: <Box size={18} />,
    items: [
      "Caja Cartón Chica", "Caja Cartón Mediana", "Caja Cartón Grande", 
      "Caja Plástico Chica", "Caja Plástico Mediana", "Caja Plástico Grande", 
      "Bulto Chico", "Bulto Mediano", "Bulto Grande"
    ]
  }
};

const Modal = ({ title, onClose, children }) => (<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"><div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[95vh] overflow-y-auto"><div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 shadow-sm"><h3 className="font-bold text-xl text-gray-800">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"><X size={20}/></button></div><div className="p-8">{children}</div></div></div>);

const ImagePreview = ({ url, onClose }) => (
  <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4 animate-fade-in" onClick={onClose}>
    <button onClick={onClose} className="absolute top-4 right-4 text-white bg-white/20 p-2 rounded-full hover:bg-white/40 transition">
      <X size={32} />
    </button>
    <img src={url} alt="Documento" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
    <p className="text-white/70 mt-4 text-sm">Toca cualquier parte para cerrar</p>
  </div>
);

const EditMoveModal = ({ moveData, onClose, onSuccess }) => {
  const [editingMove, setEditingMove] = useState({ ...moveData, taxType: moveData.taxType || 'retention' });
  const [tempItem, setTempItem] = useState({ name: '', quantity: 1 });
  const [deletingField, setDeletingField] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState("Sala y Estancia");

  useEffect(() => { 
      let data = { ...moveData, taxType: moveData.taxType || 'retention' };
      if (data.idUrl && !data.idUrlFront) {
          data.idUrlFront = data.idUrl;
      }
      setEditingMove(data); 
  }, [moveData]);

  const addFromCatalog = (itemLabel) => {
    const currentItems = [...(editingMove.items || [])];
    const existingIndex = currentItems.findIndex(i => i.name === itemLabel);
    if (existingIndex >= 0) { currentItems[existingIndex].quantity = Number(currentItems[existingIndex].quantity) + 1; } 
    else { currentItems.push({ name: itemLabel, quantity: 1 }); }
    setEditingMove({ ...editingMove, items: currentItems });
  };

  const addManualItem = () => {
    if (!tempItem.name) return;
    const currentItems = [...(editingMove.items || [])];
    const existingIndex = currentItems.findIndex(i => i.name.toLowerCase() === tempItem.name.toLowerCase());
    if (existingIndex >= 0) { currentItems[existingIndex].quantity = Number(currentItems[existingIndex].quantity) + Number(tempItem.quantity); } 
    else { currentItems.push({ ...tempItem }); }
    setEditingMove({ ...editingMove, items: currentItems });
    setTempItem({ name: '', quantity: 1 });
  };

  const removeItem = (index) => { const newItems = [...editingMove.items]; newItems.splice(index, 1); setEditingMove({ ...editingMove, items: newItems }); };
  const updateItemQuantity = (index, newQty) => { const newItems = [...editingMove.items]; newItems[index].quantity = Number(newQty); setEditingMove({ ...editingMove, items: newItems }); };
  const addFinancialConcept = () => { const currentConcepts = editingMove.financialItems || []; setEditingMove({ ...editingMove, financialItems: [...currentConcepts, { description: '', cost: 0, quantity: 1 }] }); };
  const removeFinancialConcept = (index) => { const currentConcepts = [...(editingMove.financialItems || [])]; currentConcepts.splice(index, 1); setEditingMove({ ...editingMove, financialItems: currentConcepts }); };
  const updateFinancialConcept = (index, field, value) => { const currentConcepts = [...(editingMove.financialItems || [])]; currentConcepts[index][field] = value; setEditingMove({ ...editingMove, financialItems: currentConcepts }); };

  const calculateTotals = () => {
    const items = editingMove.financialItems || [];
    const subtotal = items.reduce((acc, item) => acc + (Number(item.cost) * Number(item.quantity)), 0);
    let iva = 0, retention = 0;
    switch (editingMove.taxType) {
        case 'iva': iva = subtotal * 0.16; retention = 0; break;
        case 'retention': iva = subtotal * 0.16; retention = subtotal * 0.04; break;
        default: iva = 0; retention = 0; break;
    }
    const total = subtotal + iva - retention;
    setEditingMove({ ...editingMove, subtotal: subtotal.toFixed(2), iva: iva.toFixed(2), retention: retention.toFixed(2), price: total.toFixed(2) });
  };

  const handleDeleteDocument = async (fieldUrlName, fieldUrlValue) => {
    if (!window.confirm("¿Seguro que quieres eliminar este archivo?")) return;
    setDeletingField(fieldUrlName); 
    const deleteFileTask = async () => {
        try { const storage = getStorage(); const fileRef = ref(storage, fieldUrlValue); await deleteObject(fileRef); } 
        catch (err) { console.warn("Archivo físico no encontrado", err); }
    };
    deleteFileTask(); 
    try {
        const docRef = doc(db, "moves", editingMove.id);
        await updateDoc(docRef, { [fieldUrlName]: deleteField() });
        setEditingMove(prev => ({ ...prev, [fieldUrlName]: null }));
    } catch (error) { console.error(error); alert("Error al actualizar la base de datos."); } 
    finally { setDeletingField(null); }
  };

  const handleUpdateMove = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "moves", editingMove.id), {
        ...editingMove, taxType: editingMove.taxType || 'retention', notes: editingMove.notes || '', items: editingMove.items || []
      });
      alert("Servicio actualizado correctamente.");
      if (onSuccess) onSuccess(); onClose();
    } catch (error) { console.error(error); alert("Error: " + error.message); }
  };

  const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-cadena-blue focus:bg-white transition text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1.5";

  // Helper para renderizar un bloque de documento
  const DocumentBlock = ({ title, urlField, urlValue, colorClass, badgeColor }) => (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-600">{title}</span>
            {urlValue ? <span className={`text-[10px] ${badgeColor} px-2 py-0.5 rounded-full font-bold`}>CARGADO</span> : <span className="text-[10px] bg-red-50 text-red-400 px-2 py-0.5 rounded-full">PENDIENTE</span>}
        </div>
        {urlValue ? (
            <div className="flex flex-col gap-2">
                <div className="w-full h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center cursor-pointer border border-gray-200 hover:opacity-80 transition" onClick={() => setPreviewUrl(urlValue)}>
                    <img src={urlValue} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setPreviewUrl(urlValue)} className={`flex-1 ${colorClass} bg-opacity-10 text-xs font-bold py-2 rounded transition text-center flex items-center justify-center gap-2 hover:bg-opacity-20`}><Maximize2 size={14}/> VER</button>
                    <button type="button" onClick={() => handleDeleteDocument(urlField, urlValue)} disabled={!!deletingField} className={`px-3 rounded transition flex items-center justify-center ${deletingField === urlField ? 'bg-gray-100 cursor-wait' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                      {deletingField === urlField ? (<div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full"></div>) : (<Trash2 size={14}/>)}
                    </button>
                </div>
            </div>
        ) : (<div className="text-xs text-gray-400 italic text-center py-2 border-t border-dashed border-gray-100 mt-2">Esperando archivo...</div>)}
    </div>
  );

  return (
    <>
      {previewUrl && <ImagePreview url={previewUrl} onClose={() => setPreviewUrl(null)} />}

      <Modal title={`Editor de Servicio: ${editingMove.folio}`} onClose={onClose}>
        <form onSubmit={handleUpdateMove} className="space-y-8">
          
          {/* DATOS GENERALES */}
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

          {/* RUTA */}
          <div className="border-b border-gray-100 pb-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Ruta Logística</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={labelClass}>Dirección Origen</label><textarea className={`${inputClass} h-24`} value={editingMove.origin} onChange={e => setEditingMove({...editingMove, origin: e.target.value})} /></div>
              <div><label className={labelClass}>Dirección Destino</label><textarea className={`${inputClass} h-24`} value={editingMove.destination} onChange={e => setEditingMove({...editingMove, destination: e.target.value})} /></div>
            </div>
          </div>

          {/* INVENTARIO (CON ALTURA CORREGIDA PARA CELULAR) */}
          <div className="border-b border-gray-100 pb-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Package size={18}/> Inventario Detallado</h3>
            
            {/* AQUÍ ESTÁ EL CAMBIO CLAVE: md:h-[500px] h-auto */}
            <div className="flex flex-col md:flex-row gap-6 md:h-[500px] h-auto">
                
                {/* SELECCIÓN IZQUIERDA */}
                <div className="w-full md:w-1/2 flex flex-col h-full">
                    <p className="text-xs font-bold text-gray-400 mb-2">CATÁLOGO POR CATEGORÍA:</p>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 border border-gray-100 rounded-lg p-2 bg-gray-50 h-64 md:h-auto">
                        {Object.entries(FULL_CATALOG).map(([categoryName, data]) => (
                            <div key={categoryName} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <button 
                                  type="button"
                                  onClick={() => setExpandedCategory(expandedCategory === categoryName ? null : categoryName)}
                                  className={`w-full flex justify-between items-center p-3 text-sm font-bold transition ${expandedCategory === categoryName ? 'bg-cadena-blue text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                                >
                                    <div className="flex items-center gap-2">{data.icon} {categoryName}</div>
                                    {expandedCategory === categoryName ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                </button>
                                {expandedCategory === categoryName && (
                                    <div className="p-2 grid grid-cols-1 gap-1 animate-fade-in">
                                        {data.items.map((item, idx) => (
                                            <button 
                                              key={idx} 
                                              type="button" 
                                              onClick={() => addFromCatalog(item)}
                                              className="text-left text-xs p-2 hover:bg-blue-50 hover:text-blue-700 rounded transition flex justify-between group border-b border-gray-50 last:border-0"
                                            >
                                                <span>{item}</span>
                                                <span className="opacity-0 group-hover:opacity-100 font-bold bg-blue-100 px-1.5 rounded text-[10px]">+1</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* AGREGAR MANUAL */}
                    <div className="mt-4 pt-2 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-400 mb-1">¿NO ESTÁ EN LA LISTA?</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex gap-2 flex-1">
                                <input type="number" className="w-16 p-2 border border-gray-200 rounded-lg text-sm text-center" placeholder="1" value={tempItem.quantity} onChange={e => setTempItem({...tempItem, quantity: Number(e.target.value)})} />
                                <input type="text" className="flex-1 p-2 border border-gray-200 rounded-lg text-sm" placeholder="Ej. Estatua Gigante" value={tempItem.name} onChange={e => setTempItem({...tempItem, name: e.target.value})} />
                            </div>
                            <button type="button" onClick={addManualItem} className="bg-gray-800 text-white p-2 rounded-lg hover:bg-black transition flex items-center justify-center sm:w-10">
                                <Plus size={18}/> <span className="sm:hidden ml-2 text-xs font-bold">AGREGAR</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* LISTA DERECHA */}
                <div className="w-full md:w-1/2 flex flex-col h-full bg-blue-50/30 rounded-xl border border-blue-100 p-4 h-64 md:h-auto">
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase text-center">Lista de Carga ({editingMove.items?.reduce((acc, i) => acc + Number(i.quantity), 0) || 0} pzas)</p>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {editingMove.items && editingMove.items.length > 0 ? (
                            editingMove.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 bg-white p-2.5 rounded-lg shadow-sm border border-gray-100 text-sm group">
                                <input type="number" className="w-12 p-1 border border-gray-200 rounded text-center font-bold text-cadena-blue bg-blue-50 focus:bg-white transition outline-none" value={item.quantity} onChange={(e) => updateItemQuantity(index, e.target.value)} />
                                <span className="flex-1 font-medium text-gray-700 leading-tight">{item.name}</span>
                                <button type="button" onClick={() => removeItem(index)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition"><Trash2 size={15}/></button>
                            </div>
                            ))
                        ) : (<div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60"><Package size={40} className="mb-2"/><p className="text-xs">Sin artículos</p></div>)}
                    </div>
                </div>
            </div>
          </div>

          {/* FINANCIEROS */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex justify-between items-center mb-4 text-cadena-blue">
              <div className="flex items-center gap-2"><Calculator size={20} /><h3 className="text-sm font-black uppercase tracking-widest">Desglose Financiero</h3></div>
              <button type="button" onClick={addFinancialConcept} className="text-xs bg-white border border-cadena-blue px-3 py-1 rounded-full hover:bg-blue-100 transition">+ Agregar Fila</button>
            </div>
            
            <div className="space-y-4 mb-6">
              {editingMove.financialItems && editingMove.financialItems.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                      <div className="grid grid-cols-12 gap-3 items-end">
                          
                          {/* Descripción */}
                          <div className="col-span-12 sm:col-span-6">
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block sm:hidden">Descripción / Concepto</label>
                              <textarea className={`${inputClass} h-12 py-2 text-xs resize-none`} placeholder="Descripción..." value={item.description} onChange={(e) => updateFinancialConcept(index, 'description', e.target.value)}/>
                          </div>
                          
                          {/* Costo */}
                          <div className="col-span-5 sm:col-span-3">
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block sm:hidden">Costo</label>
                              <input type="number" className={`${inputClass} text-center`} placeholder="$0" value={item.cost} onChange={(e) => updateFinancialConcept(index, 'cost', e.target.value)}/>
                          </div>
                          
                          {/* Cantidad */}
                          <div className="col-span-5 sm:col-span-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block sm:hidden">Cant.</label>
                              <input type="number" className={`${inputClass} text-center`} placeholder="1" value={item.quantity} onChange={(e) => updateFinancialConcept(index, 'quantity', e.target.value)}/>
                          </div>
                          
                          {/* Borrar */}
                          <div className="col-span-2 sm:col-span-1">
                              <button type="button" onClick={() => removeFinancialConcept(index)} className="w-full h-[46px] flex items-center justify-center text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-100"><Trash2 size={18}/></button>
                          </div>
                      </div>
                  </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 border-t border-blue-100 pt-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Receipt size={18} className="text-gray-400"/>
                  <select className="p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-cadena-blue" value={editingMove.taxType || 'retention'} onChange={(e) => setEditingMove({...editingMove, taxType: e.target.value})}>
                      <option value="none">Sin Impuestos (Neto)</option>
                      <option value="iva">Solo IVA (16%)</option>
                      <option value="retention">IVA (16%) + Retención (-4%)</option>
                  </select>
              </div>
              <button type="button" onClick={calculateTotals} className="bg-cadena-dark text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-black transition shadow-md flex gap-2 items-center w-full sm:w-auto justify-center"><Calculator size={14}/> Calcular Totales</button>
            </div>
            <div className="flex flex-col items-end gap-2 text-sm text-gray-600">
              <div className="flex justify-between w-48"><span>Subtotal:</span> <span className="font-bold">${Number(editingMove.subtotal || 0).toLocaleString()}</span></div>
              {(editingMove.taxType === 'iva' || editingMove.taxType === 'retention') && (<div className="flex justify-between w-48"><span>IVA (16%):</span> <span className="font-bold">${Number(editingMove.iva || 0).toLocaleString()}</span></div>)}
              {editingMove.taxType === 'retention' && (<div className="flex justify-between w-48 text-red-500"><span>Retención (4%):</span> <span className="font-bold">-${Number(editingMove.retention || 0).toLocaleString()}</span></div>)}
              <div className="flex justify-between w-64 mt-2 pt-2 border-t border-cadena-blue items-center">
                  <span className="font-black text-cadena-blue">TOTAL FINAL:</span>
                  <input type="number" className="w-32 p-2 text-xl font-black text-cadena-blue bg-white border-2 border-cadena-blue rounded-lg text-right outline-none" value={editingMove.price || ''} onChange={e => setEditingMove({...editingMove, price: e.target.value})} />
              </div>
            </div>
          </div>

          {/* NOTAS Y DOCUMENTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={labelClass}>Notas / Observaciones</label><textarea className={`${inputClass} h-32 resize-none`} value={editingMove.notes || ''} onChange={e => setEditingMove({...editingMove, notes: e.target.value})} placeholder="Detalles importantes..." /></div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><UploadCloud size={16}/> Documentos del Cliente</h3>
              <div className="space-y-4">
                  <DocumentBlock title="INE / ID (FRENTE)" urlField="idUrlFront" urlValue={editingMove.idUrlFront || editingMove.idUrl} colorClass="text-blue-600 bg-blue-600" badgeColor="bg-green-100 text-green-700" />
                  <DocumentBlock title="INE / ID (REVERSO)" urlField="idUrlBack" urlValue={editingMove.idUrlBack} colorClass="text-blue-600 bg-blue-600" badgeColor="bg-green-100 text-green-700" />
                  <DocumentBlock title="COMPROBANTE DOMICILIO" urlField="addressUrl" urlValue={editingMove.addressUrl} colorClass="text-purple-600 bg-purple-600" badgeColor="bg-purple-100 text-purple-700" />
              </div>
            </div>
          </div>

          <button className="w-full bg-cadena-pink hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition flex justify-center gap-2 items-center text-lg mt-4"><Save size={20}/> Guardar Cambios y Actualizar</button>
        </form>
      </Modal>
    </>
  );
};

export default EditMoveModal;