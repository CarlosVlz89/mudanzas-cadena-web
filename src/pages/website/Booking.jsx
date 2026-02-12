import { useState } from 'react'; 
import { collection, runTransaction, doc } from 'firebase/firestore'; 
import { db } from '../../config/firebase'; 
import { 
  Truck, CheckCircle, ArrowLeft, 
  ChevronDown, ChevronUp, Sofa, Utensils, BedDouble, 
  UploadCloud, Briefcase, Box, Package, CarFront
} from 'lucide-react'; 

// --- CATÁLOGO UNIFICADO ---
const FULL_CATALOG = {
  "Sala y Estancia": {
    icon: <Sofa size={20} />,
    items: [
      "Sillón 1 Plaza", "Sillón 2 Plazas", "Sillón 3 Plazas", "Sofá Cama", 
      "Sala en L (Seccional)", "Mesa de Centro", "Librero", 
      "Mueble de TV / Entretenimiento", 
      "TV Pantalla (24\" - 42\")", "TV Pantalla (43\" - 55\")", "TV Pantalla (60\" - 85\")",
      "Ventilador", "Espejo Grande", "Cuadro / Arte"
    ]
  },
  "Comedor y Cocina": {
    icon: <Utensils size={20} />,
    items: [
      "Mesa Comedor (Madera)", "Mesa Comedor (Vidrio)", "Mesa Comedor (Tubular)",
      "Sillas de Comedor (Unitario)", "Bancos / Taburetes", "Vitrina / Credenza", 
      "Refrigerador Chico (1 pta)", "Refrigerador Grande (2 ptas)", "Refrigerador Duplex", "Frigobar / Minibar",
      "Estufa", "Microondas", "Alacena"
    ]
  },
  "Recámara": {
    icon: <BedDouble size={20} />,
    items: [
      "Base+Colchón Individual", "Base+Colchón Matrimonial", "Base+Colchón Queen", "Base+Colchón King",
      "Cabecera Individual", "Cabecera Matrimonial", "Cabecera Queen", "Cabecera King",
      "Litera", "Cuna de Bebé", 
      "Buró", "Tocador / Peinador", "Ropero / Closet"
    ]
  },
  "Lavado y Baño": {
    icon: <UploadCloud size={20} />,
    items: [
      "Lavadora", "Secadora", "Centro de Lavado (Torre)", 
      "Botes / Cestos", "Mueble de Baño"
    ]
  },
  "Oficina y Electrónica": {
    icon: <Briefcase size={20} />,
    items: [
      "Escritorio", "Silla de Oficina", "Computadora / Monitor", "Impresora / Multifuncional"
    ]
  },
  "Cajas y Bultos": {
    icon: <Box size={20} />,
    items: [
      "Caja Cartón Chica", "Caja Cartón Mediana", "Caja Cartón Grande", 
      "Caja Plástico Chica", "Caja Plástico Mediana", "Caja Plástico Grande", 
      "Bulto Chico", "Bulto Mediano", "Bulto Grande"
    ]
  },
  "Vehículos y Varios": {
    icon: <CarFront size={20} />,
    items: [
      "Bicicleta", "Motocicleta", "Auto Compacto", "Auto Sedán", "Auto Deportivo", "Camioneta",
      "Escalera", "Macetas", "Piano", "Caja Fuerte"
    ]
  }
};

const Booking = () => { 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false); 
  const [successId, setSuccessId] = useState(null); 
   
  const [form, setForm] = useState({ 
    client: '', phone: '', date: '',  
    origin: '', destination: '',  
    notes: '' 
  }); 

  const [itemsCount, setItemsCount] = useState({}); 
  const [expandedCategory, setExpandedCategory] = useState("Sala y Estancia"); 
  const [customItem, setCustomItem] = useState('');

  const handleToggleCategory = (categoryName) => {
    const isOpening = expandedCategory !== categoryName;
    setExpandedCategory(isOpening ? categoryName : null);
    if (isOpening) {
      setTimeout(() => {
        const element = document.getElementById(`cat-${categoryName}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const addItem = (name) => {
    setItemsCount(prev => {
      const current = prev[name] || 0;
      return { ...prev, [name]: current + 1 };
    });
  };

  const addCustomItem = () => {
    if (!customItem.trim()) return;
    addItem(customItem.trim());
    setCustomItem('');
  };

  // --- NUEVA FUNCIÓN: DETECTAR ENTER ---
  const handleCustomItemKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // IMPORTANTE: Evita que se envíe el formulario principal
      addCustomItem();
    }
  };

  const removeItem = (name) => {
    setItemsCount(prev => {
      const current = prev[name] || 0;
      if (current <= 1) {
        const newState = { ...prev };
        delete newState[name];
        return newState;
      }
      return { ...prev, [name]: current - 1 };
    });
  };

  const deleteCompleteItem = (name) => {
    setItemsCount(prev => {
        const newState = { ...prev };
        delete newState[name];
        return newState;
    });
  };

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    setLoading(true); 
    try { 
      const selectedItems = Object.entries(itemsCount).map(([name, qty]) => ({ 
          name: name, 
          quantity: qty 
      }));

      let generatedFolio = '';

      await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, "counters", "moves_counter");
        const counterSnap = await transaction.get(counterRef);

        let newCount = 1;
        if (counterSnap.exists()) {
          newCount = counterSnap.data().current + 1;
        }

        generatedFolio = `MUD-${String(newCount).padStart(4, '0')}`;
        const newMoveRef = doc(collection(db, "moves"));

        transaction.set(newMoveRef, { 
          ...form, 
          items: selectedItems, 
          folio: generatedFolio, 
          status: 'Pendiente', 
          porcentaje: 0, 
          price: 0, 
          subtotal: 0, iva: 0, retention: 0,
          financialItems: [{ description: "FLETE COTIZACIÓN PENDIENTE", cost: 0, quantity: 1 }],
          createdAt: new Date() 
        });

        transaction.set(counterRef, { current: newCount });
      });

      setSuccessId(generatedFolio); 
    } catch (error) { 
      console.error(error); 
      alert("Error al enviar. Intenta de nuevo."); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  if (successId) { 
    return ( 
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden"> 
        <div className="absolute top-0 right-0 w-96 h-96 bg-cadena-blue/10 rounded-full blur-3xl pointer-events-none"></div> 
        <div className="relative z-10 bg-white/40 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md border border-white/60 animate-fade-in-up"> 
          <div className="w-24 h-24 bg-green-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 rotate-12"> 
            <CheckCircle size={48} /> 
          </div> 
          <h2 className="text-3xl font-black text-cadena-dark">¡Recibido!</h2> 
          <p className="text-gray-600 mt-4 font-medium"> 
            Tu folio de cotización es:  
            <span className="font-black text-cadena-blue text-3xl block mt-2 bg-white/50 py-2 rounded-2xl border border-white tracking-tighter">{successId}</span> 
          </p> 
          <p className="text-sm text-gray-500 mt-6 leading-relaxed"> 
            Un asesor analizará tu inventario y te contactará por WhatsApp en breve con tu cotización oficial. 
          </p> 
          <a href="/" className="block mt-8 bg-cadena-dark text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl">Volver al Inicio</a> 
        </div> 
      </div> 
    ); 
  } 

  return ( 
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 relative overflow-hidden"> 
      <div className="absolute top-20 left-10 w-72 h-72 bg-cadena-pink/10 rounded-full blur-3xl pointer-events-none"></div> 
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cadena-blue/10 rounded-full blur-3xl pointer-events-none"></div> 

      <div className="max-w-3xl mx-auto relative z-10"> 
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/60"> 
           
          {/* HEADER */} 
          <div className="bg-gradient-to-r from-cadena-blue to-blue-700 p-8 text-white relative"> 
            <div className="flex justify-between items-center"> 
              <div> 
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full border border-white/30"> 
                  Cotización en línea 
                </span> 
                <h2 className="text-3xl font-black mt-3">Calcula tu Mudanza</h2> 
                <p className="text-blue-100 text-sm mt-1 font-medium">Paso {step} de 2: {step === 1 ? 'Tus Datos' : 'Inventario'}</p> 
              </div> 
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md"> 
                <Truck size={32} /> 
              </div> 
            </div> 
            <div className="absolute bottom-0 left-0 h-1 bg-cadena-pink transition-all duration-500" style={{ width: `${(step/2)*100}%` }}></div> 
          </div> 

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8"> 
             
            {/* PASO 1: DATOS PERSONALES */} 
            {step === 1 && ( 
              <div className="space-y-6 animate-fade-in"> 
                <div className="flex items-center gap-3 mb-2"> 
                  <div className="w-1.5 h-6 bg-cadena-pink rounded-full"></div> 
                  <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Información de Contacto</h3> 
                </div> 
                 
                <div className="grid grid-cols-1 gap-4"> 
                  <div className="group"> 
                    <input required placeholder="Nombre Completo" className="w-full p-4 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-white focus:border-cadena-blue focus:bg-white outline-none transition-all shadow-sm"  
                      value={form.client} onChange={e => setForm({...form, client: e.target.value})} /> 
                  </div> 
                  <input required type="tel" placeholder="Teléfono (WhatsApp)" className="w-full p-4 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-white focus:border-cadena-blue focus:bg-white outline-none transition-all shadow-sm"  
                    value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /> 
                   
                  <div className="space-y-1"> 
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Fecha deseada del servicio</label> 
                    <input required type="date" className="w-full p-4 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-white focus:border-cadena-blue focus:bg-white outline-none transition-all shadow-sm"  
                      value={form.date} onChange={e => setForm({...form, date: e.target.value})} /> 
                  </div> 
                </div> 

                <button type="button" onClick={() => setStep(2)} className="w-full bg-cadena-dark text-white py-5 rounded-2xl font-black text-lg mt-4 hover:bg-black transition shadow-xl shadow-gray-200 flex items-center justify-center gap-3"> 
                  Siguiente: Inventario <Truck size={20} /> 
                </button> 
              </div> 
            )} 

            {/* PASO 2: INVENTARIO Y RUTA */} 
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                
                {/* 1. SECCIÓN DE RUTA */}
                <div className="bg-blue-50/50 p-4 sm:p-6 rounded-3xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="w-1.5 h-6 bg-cadena-blue rounded-full"></div>
                     <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Ruta del Servicio</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="origin" className="text-[10px] font-black text-cadena-blue uppercase ml-4">Dirección de Origen</label>
                      <input id="origin" required placeholder="Calle, Número, Colonia, Ciudad, CP" className="w-full p-3 sm:p-4 bg-white rounded-2xl border border-blue-100 focus:border-cadena-blue focus:ring-2 focus:ring-blue-100 outline-none shadow-sm text-sm" 
                        value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="destination" className="text-[10px] font-black text-cadena-pink uppercase ml-4">Dirección de Destino</label>
                      <input id="destination" required placeholder="Calle, Número, Colonia, Ciudad, CP" className="w-full p-3 sm:p-4 bg-white rounded-2xl border border-pink-100 focus:border-cadena-pink focus:ring-2 focus:ring-pink-100 outline-none shadow-sm text-sm" 
                        value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
                    </div>
                  </div>
                </div> 

                {/* 2. SECCIÓN DE INVENTARIO (ACORDEÓN CON SCROLL) */} 
                <div> 
                  <div className="flex items-center gap-3 mb-6"> 
                    <div className="w-1.5 h-6 bg-cadena-blue rounded-full"></div> 
                    <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Selecciona tus Muebles</h3> 
                  </div> 
                  
                  <div className="space-y-3">
                      {Object.entries(FULL_CATALOG).map(([category, data]) => (
                          <div 
                            key={category} 
                            id={`cat-${category}`} 
                            className="border-2 border-white bg-white/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition scroll-mt-20"
                          >
                              <button 
                                type="button"
                                onClick={() => handleToggleCategory(category)} 
                                className={`w-full flex justify-between items-center p-4 font-bold text-left transition ${expandedCategory === category ? 'bg-cadena-blue text-white' : 'text-gray-700 hover:bg-white/60'}`}
                              >
                                  <div className="flex items-center gap-3">
                                      {data.icon}
                                      <span>{category}</span>
                                  </div>
                                  {expandedCategory === category ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                              </button>
                              
                              {expandedCategory === category && (
                                  <div className="p-2 bg-white/80 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
                                      {data.items.map((item, idx) => (
                                          <button 
                                            key={idx} 
                                            type="button" 
                                            onClick={() => addItem(item)}
                                            className="flex justify-between items-center p-3 text-sm text-gray-600 bg-slate-50 hover:bg-blue-50 hover:text-cadena-blue rounded-xl transition group text-left"
                                          >
                                              <span className="leading-tight">{item}</span>
                                              <span className="bg-white shadow-sm border border-gray-100 text-gray-400 group-hover:bg-cadena-blue group-hover:text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition">
                                                  +
                                              </span>
                                          </button>
                                      ))}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>

                  {/* AGREGAR ARTÍCULO MANUAL CON ENTER */}
                  <div className="mt-4 p-4 bg-white/40 border border-white rounded-2xl">
                     <p className="text-xs font-bold text-gray-500 uppercase mb-2">¿No encuentras algo?</p>
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Ej. Máquina de coser, Asador grande..." 
                          className="flex-1 p-3 rounded-xl border border-gray-200 text-sm focus:border-cadena-blue outline-none"
                          value={customItem}
                          onChange={(e) => setCustomItem(e.target.value)}
                          onKeyDown={handleCustomItemKeyDown} // <--- AQUÍ ESTÁ LA MAGIA DEL ENTER
                        />
                        <button 
                          type="button"
                          onClick={addCustomItem}
                          className="bg-gray-800 text-white px-4 rounded-xl font-bold text-xs hover:bg-black transition"
                        >
                           AGREGAR
                        </button>
                     </div>
                  </div>
                </div>

                {/* 3. RESUMEN DE INVENTARIO */}
                <div className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-inner">
                    <h3 className="font-black text-gray-800 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                        <Package size={16}/> Resumen de Inventario
                    </h3>
                    
                    {Object.keys(itemsCount).length === 0 ? (
                        <div className="text-center py-8 text-gray-400 italic text-sm">
                            No has seleccionado ningún mueble aún.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(itemsCount).map(([name, count]) => (
                                <div key={name} className="flex flex-col sm:flex-row items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-50 gap-3">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <span className="font-black text-cadena-blue bg-blue-50 w-8 h-8 flex items-center justify-center rounded-full text-sm shrink-0">
                                            {count}
                                        </span>
                                        <span className="text-sm font-bold text-gray-700 leading-tight">{name}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                          type="button" 
                                          onClick={() => removeItem(name)} 
                                          className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-300 transition"
                                        >
                                            <span className="text-xl font-black mb-1">-</span>
                                        </button>
                                        
                                        <button 
                                          type="button" 
                                          onClick={() => addItem(name)} 
                                          className="w-10 h-10 flex items-center justify-center bg-cadena-blue rounded-lg text-white hover:bg-blue-700 transition shadow-md shadow-blue-200"
                                        >
                                            <span className="text-xl font-black mb-1">+</span>
                                        </button>
                                        
                                        <div className="w-px h-6 bg-gray-300 mx-2"></div>

                                        <button 
                                          type="button" 
                                          onClick={() => deleteCompleteItem(name)} 
                                          className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg text-red-500 hover:bg-red-200 transition"
                                        >
                                            <span className="text-xs font-black">X</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notas extra */} 
                <div className="space-y-1"> 
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Observaciones especiales</label> 
                  <textarea placeholder="Ej: Tercer piso sin elevador, volado de muebles, condominio con horario restringido..." className="w-full p-4 bg-white/50 rounded-2xl border-2 border-white focus:border-cadena-blue outline-none h-24 text-sm shadow-sm"  
                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /> 
                </div> 

                <div className="flex flex-col sm:flex-row gap-4 pt-4"> 
                  <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-2 px-8 py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-cadena-dark transition"> 
                    <ArrowLeft size={16} /> Atrás 
                  </button> 
                  <button type="submit" disabled={loading} className="flex-1 bg-cadena-pink text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-pink-200 hover:scale-[1.02] transition-all disabled:opacity-50"> 
                    {loading ? 'Procesando...' : `Finalizar Cotización (${Object.values(itemsCount).reduce((a,b)=>a+b, 0)} ítems)`} 
                  </button> 
                </div> 
              </div> 
            )} 
          </form> 
        </div> 
      </div> 
    </div> 
  ); 
}; 

export default Booking;