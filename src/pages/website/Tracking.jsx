import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Importamos herramientas de BD
import { db } from '../../config/firebase'; // Conexión a Firebase
import { Search, MapPin, Truck, Package, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import mascota from '../../assets/images/mascota.png'; 

const Tracking = () => {
  const [folio, setFolio] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Validación básica: Si está vacío, no busques
    if (!folio.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Preparamos la búsqueda: "Busca en la colección 'moves' donde el campo 'folio' sea igual a lo que escribió el usuario"
      const q = query(
        collection(db, "moves"), 
        where("folio", "==", folio.trim().toUpperCase()) // Convertimos a mayúsculas para evitar errores
      );

      // 2. Ejecutamos la búsqueda
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // ¡ENCONTRADO! Tomamos el primer resultado
        const docData = querySnapshot.docs[0].data();
        setResult(docData);
      } else {
        // NO ENCONTRADO
        setError('No encontramos ninguna mudanza con ese folio. Verifica que esté bien escrito (Ej: MUD-1234).');
      }

    } catch (err) {
      console.error(err);
      setError('Hubo un error de conexión. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Función visual para el color de la barra
  const getStatusColor = (status) => {
    switch(status) {
      case 'Finalizada': return 'bg-green-500';
      case 'En Tránsito': return 'bg-cadena-blue';
      case 'En Carga': return 'bg-cadena-pink';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* 1. CABECERA */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center p-2">
            <img src={mascota} alt="Mascota Cadena" className="w-full h-full object-contain" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-cadena-dark mb-4">
          Rastrea tu <span className="text-cadena-blue">Mudanza</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Ingresa tu número de folio (Ej: MUD-4521) para ver el estado real de tu servicio.
        </p>

        {/* BUSCADOR */}
        <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Ejemplo: MUD-1234"
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
            className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-cadena-blue focus:ring-4 focus:ring-cadena-blue/20 outline-none transition text-lg shadow-sm uppercase"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-cadena-pink hover:bg-pink-600 text-white px-6 rounded-full font-bold transition flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? '...' : <><Search size={20} /> Buscar</>}
          </button>
        </form>

        {/* ERROR */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-2 animate-pulse">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
      </div>

      {/* 2. RESULTADOS (Datos Reales de Firebase) */}
      {result && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">
          
          {/* TICKET HEADER */}
          <div className="bg-cadena-dark text-white p-6 flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-gray-400 text-sm">Cliente</p>
              <h3 className="text-xl font-bold">{result.client}</h3>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Folio</p>
              <span className="font-mono font-bold text-xl text-cadena-pink">{result.folio}</span>
            </div>
          </div>

          <div className="p-8">
            {/* RUTA */}
            <div className="flex items-center justify-between mb-8 text-cadena-dark">
              <div className="text-center w-1/3">
                <MapPin className="mx-auto text-gray-400 mb-2" />
                <p className="font-bold text-lg leading-tight">{result.origin}</p>
                <p className="text-xs text-gray-500">Origen</p>
              </div>
              <div className="flex-1 flex flex-col items-center px-4">
                <ArrowRight className="text-cadena-blue w-full h-6" />
                <p className="text-xs text-gray-400 mt-1">{result.date}</p>
              </div>
              <div className="text-center w-1/3">
                <MapPin className="mx-auto text-cadena-pink mb-2" />
                <p className="font-bold text-lg leading-tight">{result.destination}</p>
                <p className="text-xs text-gray-500">Destino</p>
              </div>
            </div>

            {/* BARRA DE PROGRESO */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Estado: <strong className="text-cadena-blue">{result.status}</strong></span>
                <span>{result.porcentaje}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${getStatusColor(result.status)}`}
                  style={{ width: `${result.porcentaje}%` }}
                ></div>
              </div>
            </div>

            {/* PASOS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-8 pt-8 border-t border-gray-100">
              <StepItem icon={<Package />} label="Empacado" active={result.porcentaje >= 25} />
              <StepItem icon={<Truck />} label="En Camino" active={result.porcentaje >= 50} />
              <StepItem icon={<MapPin />} label="Llegando" active={result.porcentaje >= 80} />
              <StepItem icon={<CheckCircle />} label="Entregado" active={result.porcentaje === 100} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StepItem = ({ icon, label, active }) => (
  <div className={`flex flex-col items-center gap-2 ${active ? 'text-cadena-blue' : 'text-gray-300'}`}>
    <div className={`p-3 rounded-full ${active ? 'bg-blue-100' : 'bg-gray-100'}`}>
      {icon}
    </div>
    <span className="font-medium text-sm">{label}</span>
  </div>
);

export default Tracking;