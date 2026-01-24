import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Truck, CheckCircle, Plus, Minus, Sofa, Tv, Box,  Bed, WashingMachine, Refrigerator } from 'lucide-react';

// CATALOGO DE MUEBLES (Lo que el cliente puede seleccionar)
const FURNITURE_ITEMS = [
  { id: 'caja_ch', label: 'Caja Chica', icon: <Box size={24} /> },
  { id: 'caja_gd', label: 'Caja Grande', icon: <Box size={32} /> },
  { id: 'sala', label: 'Sillón / Sala', icon: <Sofa size={24} /> },
  { id: 'cama_ind', label: 'Cama Indiv.', icon: <Bed size={20} /> },
  { id: 'cama_mat', label: 'Cama Matrim.', icon: <Bed size={24} /> },
  { id: 'cama_ks', label: 'Cama King Size', icon: <Bed size={28} /> },
  { id: 'refri', label: 'Refrigerador', icon: <Refrigerator size={24} /> },
  { id: 'lavadora', label: 'Lavadora/Sec', icon: <WashingMachine size={24} /> },
  { id: 'tv', label: 'TV / Pantalla', icon: <Tv size={24} /> },
];

const Booking = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);
  
  const [form, setForm] = useState({
    client: '', phone: '', date: '', 
    origin: '', destination: '', 
    notes: '' // Notas extra (ej: "Es un tercer piso")
  });

  // Estado para contar muebles: { 'caja_ch': 5, 'sala': 1 }
  const [itemsCount, setItemsCount] = useState({});

  // Función para sumar o restar
  const updateCount = (id, delta) => {
    setItemsCount(prev => {
      const current = prev[id] || 0;
      const newValue = Math.max(0, current + delta); // No permite negativos
      return { ...prev, [id]: newValue };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Filtramos solo los muebles que tengan cantidad > 0
      const selectedItems = Object.entries(itemsCount)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const item = FURNITURE_ITEMS.find(i => i.id === id);
          return { name: item.label, quantity: qty };
        });

      const folio = 'COT-' + Math.floor(1000 + Math.random() * 9000);
      
      await addDoc(collection(db, "moves"), {
        ...form,
        items: selectedItems, // Guardamos la lista estructurada
        folio: folio,
        status: 'Pendiente',
        porcentaje: 0,
        price: 0, // Precio inicial en 0 para que el admin lo ponga
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-28 pb-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-cadena-dark">¡Solicitud Recibida!</h2>
          <p className="text-gray-600 mt-4">
            Tu folio es: <span className="font-bold text-cadena-blue text-xl block mt-1">{successId}</span>
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Un asesor calculará el volumen de tu carga y te contactará al número proporcionado.
          </p>
          <a href="/" className="block mt-6 bg-cadena-dark text-white py-3 rounded-lg font-bold hover:bg-black transition">Volver al Inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Encabezado */}
        <div className="bg-cadena-blue p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Cotizar Mudanza</h2>
            <p className="text-sm opacity-80">Paso {step} de 2</p>
          </div>
          <Truck size={28} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          {/* PASO 1: DATOS PERSONALES */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-gray-700 border-b pb-2">¿Quién viaja?</h3>
              <input required placeholder="Nombre Completo" className="w-full p-4 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none" 
                value={form.client} onChange={e => setForm({...form, client: e.target.value})} />
              <input required type="tel" placeholder="Teléfono (WhatsApp)" className="w-full p-4 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none" 
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 ml-2 mb-1">Fecha deseada</label>
                <input required type="date" className="w-full p-4 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none" 
                  value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full bg-cadena-dark text-white py-4 rounded-xl font-bold mt-4 hover:bg-gray-800 transition">
                Siguiente: Inventario
              </button>
            </div>
          )}

          {/* PASO 2: INVENTARIO Y RUTA */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Ruta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Origen (Colonia/Ciudad)" className="w-full p-3 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none" 
                  value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} />
                <input required placeholder="Destino (Colonia/Ciudad)" className="w-full p-3 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none" 
                  value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
              </div>

              {/* Selector de Muebles */}
              <div>
                <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">¿Qué llevamos?</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FURNITURE_ITEMS.map((item) => (
                    <div key={item.id} className={`p-3 rounded-xl border-2 flex flex-col items-center justify-between transition-all ${itemsCount[item.id] > 0 ? 'border-cadena-blue bg-blue-50' : 'border-gray-100'}`}>
                      <div className="text-gray-600 mb-2">{item.icon}</div>
                      <span className="text-xs font-bold text-center mb-2 leading-tight">{item.label}</span>
                      
                      {/* Controles + / - */}
                      <div className="flex items-center gap-3 bg-white rounded-full px-2 py-1 shadow-sm">
                        <button type="button" onClick={() => updateCount(item.id, -1)} className="text-gray-400 hover:text-red-500"><Minus size={16} /></button>
                        <span className="font-bold w-4 text-center text-sm">{itemsCount[item.id] || 0}</span>
                        <button type="button" onClick={() => updateCount(item.id, 1)} className="text-cadena-blue hover:text-blue-700"><Plus size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas extra */}
              <textarea placeholder="¿Algo más? (Ej: Piano, cajas extra, volado de muebles...)" className="w-full p-3 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none h-20 text-sm" 
                value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-4 text-gray-500 font-bold hover:text-gray-700">Atrás</button>
                <button type="submit" disabled={loading} className="flex-1 bg-cadena-pink text-white py-4 rounded-xl font-bold shadow-lg hover:bg-pink-600 transition">
                  {loading ? 'Enviando...' : 'Finalizar Cotización'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Booking;