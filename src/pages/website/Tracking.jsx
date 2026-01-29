import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../../config/firebase'; 
import { Search, MapPin, Truck, Package, AlertCircle, ArrowRight, Home, Phone } from 'lucide-react'; 
import mascota from '../../assets/images/mascota.png'; 

const Tracking = () => {
  const [folio, setFolio] = useState('');
  const [phone, setPhone] = useState(''); // Estado para el teléfono agregado
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!folio.trim() || !phone.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Consulta de seguridad: Debe coincidir Folio Y Teléfono
      const q = query(
        collection(db, "moves"), 
        where("folio", "==", folio.trim().toUpperCase()),
        where("phone", "==", phone.trim())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setResult(querySnapshot.docs[0].data());
      } else {
        setError('Los datos no coinciden. Revisa tu folio y el teléfono registrado.');
      }
    } catch (err) {
      console.error(err);
      setError('Hubo un error de conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (status, dbPercent) => {
    if (dbPercent && dbPercent > 0) return dbPercent;
    switch (status) {
      case 'Pendiente': return 5;
      case 'Programada': return 10;
      case 'Contrato Firmado': return 15;
      case 'En Carga': return 35;     
      case 'En Tránsito': return 70;  
      case 'Finalizada': return 100;  
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Finalizada': return 'bg-green-500';
      case 'En Tránsito': return 'bg-cadena-blue';
      case 'En Carga': return 'bg-cadena-pink';
      default: return 'bg-gray-300';
    }
  };

  const currentPercent = result ? calculateProgress(result.status, result.porcentaje) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* --- EFECTO LIQUID BACKGROUND --- */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cadena-blue/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cadena-pink/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/4 pointer-events-none z-0"></div>

      <div className="relative z-10">
        {/* CABECERA */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center p-2 border border-white/50">
              <img src={mascota} alt="Mascota Cadena" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-cadena-dark mb-4">
            Rastrea tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cadena-blue to-cadena-pink">Mudanza</span>
          </h1>
          <p className="text-gray-600 mb-8 font-medium">
            Ingresa tu número de folio y teléfono para validar tu identidad.
          </p>

          {/* FORMULARIO DE BÚSQUEDA CORREGIDO */}
          <form onSubmit={handleSearch} className="space-y-4 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Folio (MUD-XXXX)"
                value={folio}
                onChange={(e) => setFolio(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/50 backdrop-blur-sm border-2 border-white focus:border-cadena-blue outline-none transition text-lg shadow-lg uppercase"
              />
            </div>
            
            <div className="relative">
              <input
                type="tel"
                placeholder="Teléfono registrado"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/50 backdrop-blur-sm border-2 border-white focus:border-cadena-blue outline-none transition text-lg shadow-lg"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-cadena-pink hover:bg-pink-600 text-white py-4 rounded-2xl font-black transition flex items-center justify-center gap-2 shadow-xl shadow-pink-200 disabled:opacity-70"
            >
              {loading ? 'Buscando...' : <><Search size={20} /> Rastrear Mudanza</>}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 max-w-md mx-auto bg-red-50/80 backdrop-blur-sm text-red-600 rounded-xl border border-red-100 flex items-center justify-center gap-2 animate-pulse">
              <AlertCircle size={20} />{error}
            </div>
          )}
        </div>

        {/* RESULTADOS (GLASSMORPISM CARD) */}
        {result && (
          <div className="max-w-4xl mx-auto bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/60 animate-fade-in-up">
            
            <div className="bg-gradient-to-r from-cadena-dark to-slate-800 text-white p-8 flex justify-between items-center flex-wrap gap-4 border-b border-white/20">
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-1">Cliente</p>
                <h3 className="text-2xl font-bold">{result.client}</h3>
              </div>
              <div className="text-right">
                <p className="text-pink-200 text-xs uppercase tracking-widest font-bold mb-1">Folio de Seguimiento</p>
                <span className="font-mono font-bold text-2xl text-white bg-white/10 px-4 py-1 rounded-lg border border-white/20">{result.folio}</span>
              </div>
            </div>

            <div className="p-10">
              {/* RUTA */}
              <div className="flex items-center justify-between mb-12 bg-white/30 p-6 rounded-3xl border border-white/40">
                <div className="text-center w-1/3">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 text-cadena-blue">
                    <MapPin size={24} />
                  </div>
                  <p className="font-bold text-lg text-gray-800 leading-tight">{result.origin}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-1">Origen</p>
                </div>
                
                <div className="flex-1 flex flex-col items-center px-4 relative">
                  <div className="w-full h-[2px] bg-gradient-to-r from-cadena-blue to-cadena-pink relative top-3">
                    <div className="absolute -right-1 -top-[9px] text-cadena-pink">
                      <ArrowRight size={20} strokeWidth={3} />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-cadena-blue mt-6 bg-blue-50/50 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-100 uppercase">
                    {result.date}
                  </p>
                </div>

                <div className="text-center w-1/3">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 text-cadena-pink">
                    <MapPin size={24} />
                  </div>
                  <p className="font-bold text-lg text-gray-800 leading-tight">{result.destination}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-1">Destino</p>
                </div>
              </div>

              {/* BARRA DE PROGRESO */}
              <div className="mb-12">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Estado Actual</span>
                    <p className="text-2xl font-black text-cadena-dark">{result.status}</p>
                  </div>
                  <span className="text-3xl font-black text-cadena-blue">{currentPercent}%</span>
                </div>
                <div className="w-full bg-gray-200/50 rounded-full h-5 p-1 border border-white shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${getStatusColor(result.status)}`}
                    style={{ width: `${currentPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* PASOS */}
              <div className="grid grid-cols-3 gap-4 text-center relative">
                <StepItem 
                  icon={<Package size={28} />} 
                  label="Recolección" 
                  active={currentPercent >= 30} 
                  color="text-cadena-pink" 
                  bgColor="bg-white"
                />
                <StepItem 
                  icon={<Truck size={28} />} 
                  label="En Ruta" 
                  active={currentPercent >= 60} 
                  color="text-cadena-blue" 
                  bgColor="bg-white"
                />
                <StepItem 
                  icon={<Home size={28} />} 
                  label="Entregado" 
                  active={currentPercent === 100} 
                  color="text-green-600" 
                  bgColor="bg-white"
                />
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StepItem = ({ icon, label, active, color, bgColor }) => (
  <div className={`flex flex-col items-center gap-3 transition-all duration-700 ${active ? 'opacity-100 scale-105' : 'opacity-30 grayscale'}`}>
    <div className={`w-20 h-20 rounded-3xl shadow-xl flex items-center justify-center border-2 transition-all duration-700 ${active ? `${bgColor} border-white shadow-blue-200/50` : 'bg-gray-100/50 border-transparent'}`}>
      <div className={active ? color : 'text-gray-400'}>
        {icon}
      </div>
    </div>
    <span className={`font-black text-xs uppercase tracking-tighter ${active ? 'text-cadena-dark' : 'text-gray-400'}`}>{label}</span>
  </div>
);

export default Tracking;