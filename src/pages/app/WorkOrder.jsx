import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MapPin, Phone, Calendar, Package } from 'lucide-react';

const WorkOrder = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      // Solo traemos los que ya están firmados o en tránsito
      const q = query(collection(db, "moves"), where("status", "in", ["Contrato Firmado", "En Tránsito"]));
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsData);
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white">
      <h1 className="text-2xl font-bold mb-6 text-center text-cadena-blue">Órdenes de Trabajo</h1>
      
      <div className="space-y-4">
        {jobs.length === 0 && <p className="text-center text-gray-500">No hay trabajos activos hoy.</p>}
        
        {jobs.map(job => (
          <div key={job.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-cadena-pink text-xs font-bold px-2 py-1 rounded">FOLIO: {job.folio}</span>
              <span className="text-gray-400 text-sm flex items-center gap-1"><Calendar size={14}/> {job.date}</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <MapPin className="text-green-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Origen</p>
                  <p className="font-medium">{job.origin}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="text-red-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Destino</p>
                  <p className="font-medium">{job.destination}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Contacto Sitio</p>
                  <p className="font-medium text-lg">{job.phone}</p>
                </div>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg mt-2">
                <p className="text-xs text-gray-500 uppercase flex items-center gap-1"><Package size={12}/> Notas de carga</p>
                <p className="text-sm italic text-gray-300">{job.items || "Sin especificaciones"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkOrder;