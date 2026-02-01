import { useState } from 'react'; 
import { collection, addDoc } from 'firebase/firestore'; 
import { db } from '../../config/firebase'; 
import { 
  Truck, CheckCircle, Plus, Minus, Sofa, Tv, Box, Bed, 
  WashingMachine, Refrigerator, ArrowLeft, CarFront, Bike, 
  Frame, Music2, Table2, Monitor, Container, Archive 
} from 'lucide-react'; 

// --- INVENTARIO COMPLETO (Motos, Autos, Pianos, etc.) ---
const FURNITURE_ITEMS = [ 
  // Básicos
  { id: 'caja_ch', label: 'Caja Chica', icon: <Box size={20} /> }, 
  { id: 'caja_gd', label: 'Caja Grande', icon: <Box size={28} /> }, 
  { id: 'sala', label: 'Sillón / Sala', icon: <Sofa size={22} /> }, 
  { id: 'comedor', label: 'Mesa Comedor', icon: <Table2 size={22} /> }, 
  { id: 'cama_ind', label: 'Cama Indiv.', icon: <Bed size={18} /> }, 
  { id: 'cama_mat', label: 'Cama Matrim.', icon: <Bed size={22} /> }, 
  { id: 'cama_ks', label: 'Cama King Size', icon: <Bed size={26} /> }, 
  { id: 'refri', label: 'Refrigerador', icon: <Refrigerator size={22} /> }, 
  { id: 'lavadora', label: 'Lavadora/Sec', icon: <WashingMachine size={22} /> }, 
  { id: 'tv', label: 'TV / Pantalla', icon: <Tv size={22} /> }, 
  { id: 'escritorio', label: 'Escritorio/Office', icon: <Monitor size={22} /> },

  // Vehículos
  { id: 'bici', label: 'Bicicleta', icon: <Bike size={22} /> },
  { id: 'moto', label: 'Motocicleta', icon: <Bike size={26} className="text-slate-800" /> }, 
  { id: 'auto', label: 'Automóvil', icon: <CarFront size={24} /> },
  
  // Especiales / Fletes
  { id: 'arte', label: 'Obra de Arte', icon: <Frame size={22} /> },
  { id: 'piano', label: 'Piano', icon: <Music2 size={22} /> },
  { id: 'fuerte', label: 'Caja Fuerte', icon: <Archive size={22} /> },
  { id: 'pallet', label: 'Pallet / Carga', icon: <Container size={22} /> },
]; 

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

  const updateCount = (id, delta) => { 
    setItemsCount(prev => { 
      const current = prev[id] || 0; 
      const newValue = Math.max(0, current + delta); 
      return { ...prev, [id]: newValue }; 
    }); 
  }; 

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    setLoading(true); 
    try { 
      const selectedItems = Object.entries(itemsCount) 
        .filter(([_, qty]) => qty > 0) 
        .map(([id, qty]) => { 
          const item = FURNITURE_ITEMS.find(i => i.id === id); 
          return { name: item.label, quantity: qty }; 
        }); 

      const folio = 'MUD-' + Math.floor(1000 + Math.random() * 9000); 
      await addDoc(collection(db, "moves"), { 
        ...form, 
        items: selectedItems, 
        folio: folio, 
        status: 'Pendiente', 
        porcentaje: 0, 
        price: 0, 
        createdAt: new Date() 
      }); 
      setSuccessId(folio); 
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
            Un asesor analizará tu inventario y te contactará por WhatsApp para darte el mejor precio. 
          </p> 
          <a href="/" className="block mt-8 bg-cadena-dark text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl">Volver al Inicio</a> 
        </div> 
      </div> 
    ); 
  } 

  return ( 
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 relative overflow-hidden"> 
      {/* --- LIQUID GLASS BACKGROUND --- */} 
      <div className="absolute top-20 left-10 w-72 h-72 bg-cadena-pink/10 rounded-full blur-3xl pointer-events-none"></div> 
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cadena-blue/10 rounded-full blur-3xl pointer-events-none"></div> 

      <div className="max-w-3xl mx-auto relative z-10"> 
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/60"> 
           
          {/* HEADER DEL FORMULARIO */} 
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
            {/* Barra de progreso visual */} 
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
                
                <div className="bg-blue-50/50 p-4 sm:p-6 rounded-3xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="w-1.5 h-6 bg-cadena-blue rounded-full"></div>
                     <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Ruta del Servicio</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="origin" className="text-[10px] font-black text-cadena-blue uppercase ml-4">Dirección de Origen (Completa)</label>
                      <input 
                        id="origin"
                        name="origin"
                        required 
                        placeholder="Calle, Número, Colonia, Ciudad, CP" 
                        className="w-full p-3 sm:p-4 bg-white rounded-2xl border border-blue-100 focus:border-cadena-blue focus:ring-2 focus:ring-blue-100 outline-none shadow-sm text-sm" 
                        value={form.origin} 
                        onChange={e => setForm({...form, origin: e.target.value})} 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="destination" className="text-[10px] font-black text-cadena-pink uppercase ml-4">Dirección de Destino (Completa)</label>
                      <input 
                        id="destination"
                        name="destination"
                        required 
                        placeholder="Calle, Número, Colonia, Ciudad, CP" 
                        className="w-full p-3 sm:p-4 bg-white rounded-2xl border border-pink-100 focus:border-cadena-pink focus:ring-2 focus:ring-pink-100 outline-none shadow-sm text-sm" 
                        value={form.destination} 
                        onChange={e => setForm({...form, destination: e.target.value})} 
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-3 text-center italic">
                    * Ingresa direcciones exactas para calcular la distancia correctamente.
                  </p>
                </div> 

                {/* Selector de Muebles */} 
                <div> 
                  <div className="flex items-center gap-3 mb-6"> 
                    <div className="w-1.5 h-6 bg-cadena-blue rounded-full"></div> 
                    <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Lista de Inventario</h3> 
                  </div> 
                  
                  {/* Grid: Ajustado para que no se pegue */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"> 
                    {FURNITURE_ITEMS.map((item) => ( 
                      <div key={item.id} className={`p-3 rounded-[2rem] border-2 flex flex-col items-center justify-between transition-all duration-300 ${itemsCount[item.id] > 0 ? 'border-cadena-blue bg-white shadow-lg shadow-blue-100 scale-105' : 'border-white bg-white/30 opacity-70'}`}> 
                        
                        <div className={`mb-2 ${itemsCount[item.id] > 0 ? 'text-cadena-blue' : 'text-gray-400'}`}>
                            {item.icon}
                        </div> 
                        
                        <span className="text-[10px] font-black text-center mb-3 leading-tight uppercase tracking-tighter text-gray-700 min-h-[2em] flex items-center justify-center">
                            {item.label}
                        </span> 
                        
                        {/* CONTENEDOR COMPACTO PARA MÓVIL */}
                        {/* Ajuste: px-2 py-1.5 (más chico en móvil) sm:px-3 sm:py-2 (normal en PC) */}
                        <div className="flex items-center justify-between w-full bg-slate-100 rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2"> 
                          <button type="button" onClick={() => updateCount(item.id, -1)} className="text-gray-400 hover:text-red-500 transition p-1">
                              <Minus size={14} strokeWidth={3} />
                          </button> 
                          <span className="font-black w-4 text-center text-xs text-cadena-dark">
                              {itemsCount[item.id] || 0}
                          </span> 
                          <button type="button" onClick={() => updateCount(item.id, 1)} className="text-cadena-blue hover:text-blue-700 transition p-1">
                              <Plus size={14} strokeWidth={3} />
                          </button> 
                        </div> 
                      </div> 
                    ))} 
                  </div> 
                </div> 

                {/* Notas extra */} 
                <div className="space-y-1"> 
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Observaciones especiales</label> 
                  <textarea placeholder="Ej: Piano, tercer piso sin elevador, requiere volado de muebles..." className="w-full p-4 bg-white/50 rounded-2xl border-2 border-white focus:border-cadena-blue outline-none h-24 text-sm shadow-sm"  
                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /> 
                </div> 

                <div className="flex flex-col sm:flex-row gap-4 pt-4"> 
                  <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-2 px-8 py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-cadena-dark transition"> 
                    <ArrowLeft size={16} /> Atrás 
                  </button> 
                  <button type="submit" disabled={loading} className="flex-1 bg-cadena-pink text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-pink-200 hover:scale-[1.02] transition-all disabled:opacity-50"> 
                    {loading ? 'Procesando...' : 'Finalizar Cotización'} 
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