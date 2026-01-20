import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Truck, Calendar, MapPin, Package, CheckCircle } from 'lucide-react';

const Booking = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);
  
  const [form, setForm] = useState({
    client: '', phone: '', date: '', 
    origin: '', destination: '', 
    items: '', // Texto libre para simplificar
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Generamos folio
      const folio = 'COT-' + Math.floor(1000 + Math.random() * 9000);
      
      await addDoc(collection(db, "moves"), {
        ...form,
        folio: folio,
        status: 'Pendiente', // Estado inicial
        porcentaje: 0,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-cadena-dark">¡Solicitud Recibida!</h2>
          <p className="text-gray-600 mt-4">
            Tu folio es: <span className="font-bold text-cadena-blue">{successId}</span>
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Un asesor revisará tu solicitud y te contactará por teléfono en breve para confirmar el precio y enviarte el contrato.
          </p>
          <a href="/" className="block mt-6 bg-cadena-dark text-white py-3 rounded-lg font-bold">Volver al Inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-cadena-blue p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Cotizar Mudanza</h2>
          <Truck />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-gray-700">Datos Personales</h3>
              <input required placeholder="Nombre Completo" className="w-full p-4 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none" 
                value={form.client} onChange={e => setForm({...form, client: e.target.value})} />
              <input required type="tel" placeholder="Teléfono (WhatsApp)" className="w-full p-4 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none" 
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 ml-2 mb-1">Fecha deseada</label>
                <input required type="date" className="w-full p-4 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none" 
                  value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full bg-cadena-dark text-white py-4 rounded-xl font-bold mt-4">Siguiente</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-gray-700">Ruta y Carga</h3>
              <input required placeholder="Dirección de Origen (Ciudad/Colonia)" className="w-full p-4 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none" 
                value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} />
              <input required placeholder="Dirección de Destino (Ciudad/Colonia)" className="w-full p-4 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none" 
                value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
              <textarea placeholder="Describe brevemente qué vamos a transportar (Ej: Sala, Refri, 10 cajas, Cama KS...)" className="w-full p-4 bg-gray-50 rounded-xl border focus:border-cadena-blue outline-none h-32" 
                value={form.items} onChange={e => setForm({...form, items: e.target.value})} />
              
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-4 text-gray-500 font-bold">Atrás</button>
                <button type="submit" disabled={loading} className="flex-1 bg-cadena-pink text-white py-4 rounded-xl font-bold shadow-lg">
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