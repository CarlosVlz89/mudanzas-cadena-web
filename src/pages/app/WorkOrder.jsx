import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MapPin, Phone, Calendar, Package, AlertCircle, Printer } from 'lucide-react';

const WorkOrder = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(
            collection(db, "moves"), 
            where("status", "in", ["Contrato Firmado", "En Carga", "En Tránsito"]),
            orderBy("date", "asc")
        );
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsData);
      } catch (error) {
        console.error("Error cargando trabajos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 p-4 print:bg-white print:text-black print:p-0 print:m-0">
      
      <button 
        onClick={() => window.print()} 
        className="fixed bottom-4 right-4 bg-cadena-blue text-white p-4 rounded-full shadow-xl z-50 print:hidden hover:bg-blue-700 transition"
      >
        <Printer size={24} />
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center text-cadena-blue border-b border-gray-800 pb-4 print:hidden">
        Órdenes de Carga Activas
      </h1>
      
      <div className="space-y-6 print:space-y-4 print:block">
        {jobs.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <Package size={48} className="mx-auto mb-4"/>
            <p>No hay trabajos activos.</p>
          </div>
        )}
        
        {jobs.map(job => (
          <div key={job.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg relative overflow-hidden break-inside-avoid print:bg-white print:border-b-2 print:border-black print:shadow-none print:rounded-none print:p-0 print:mb-6 print:page-break-inside-avoid">
            
            {/* Cabecera */}
            <div className="flex justify-between items-start mb-4 pl-2 print:mb-2 print:border-b print:border-gray-300 print:pb-2">
              <div className="flex items-center gap-4">
                 <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider print:text-black print:text-[10px]">FOLIO</span>
                    <span className="text-xl font-black text-white print:text-black">{job.folio}</span>
                 </div>
                 {/* Estado */}
                 <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase print:hidden ${job.status === 'En Tránsito' ? 'bg-green-500/20 text-green-400' : 'bg-pink-500/20 text-pink-400'}`}>
                    {job.status}
                 </div>
              </div>
              
              <div className="text-right">
                 <div className="bg-gray-900/50 px-3 py-1 rounded-lg border border-gray-600 inline-flex items-center gap-2 print:bg-transparent print:border-0 print:p-0">
                    <Calendar size={14} className="text-cadena-blue print:text-black"/> 
                    <span className="text-sm font-bold print:text-black">{job.date}</span>
                 </div>
              </div>
            </div>
            
            <div className="space-y-4 pl-2 print:space-y-1">
              
              {/* Origen/Destino y Contacto en una sola fila al imprimir para ahorrar espacio */}
              <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-3 gap-4 print:gap-2 print:text-[10px]">
                 <div className="border-l-2 border-green-500 pl-3">
                    <p className="text-[10px] text-gray-500 uppercase font-bold print:text-black">Origen</p>
                    <p className="font-medium text-gray-200 leading-tight print:text-black">{job.origin}</p>
                 </div>
                 <div className="border-l-2 border-red-500 pl-3">
                    <p className="text-[10px] text-gray-500 uppercase font-bold print:text-black">Destino</p>
                    <p className="font-medium text-gray-200 leading-tight print:text-black">{job.destination}</p>
                 </div>
                 <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex gap-3 items-center print:bg-transparent print:border-0 print:p-0 print:block">
                    <div className="print:hidden bg-blue-500/20 p-1.5 rounded-full text-blue-400"><Phone size={16} /></div>
                    <div>
                       <p className="text-[10px] text-gray-500 uppercase font-bold print:text-black">Contacto</p>
                       <p className="font-bold text-white print:text-black">{job.phone}</p>
                       <p className="text-xs text-gray-400 print:text-black">{job.client}</p>
                    </div>
                 </div>
              </div>

              {/* --- INVENTARIO (GRID 3 COLUMNAS EN PC, 4 EN IMPRESIÓN) --- */}
              <div className="mt-4 pt-4 border-t border-gray-700 print:border-black print:mt-2 print:pt-2">
                <p className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2 mb-2 print:text-black print:mb-1 print:text-[10px]">
                    <Package size={12} className="text-cadena-pink print:hidden"/> Inventario
                </p>
                
                <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700/50 min-h-[50px] print:bg-transparent print:border-none print:p-0">
                   
                   {/* VALIDACIÓN DE TIPO DE DATO */}
                   {Array.isArray(job.items) && job.items.length > 0 ? (
                       
                       // AQUÍ ESTÁ EL CAMBIO:
                       // grid-cols-2 (celular)
                       // md:grid-cols-3 (pantalla pc)
                       // print:grid-cols-4 (papel - 4 columnas forzadas)
                       <div className="grid grid-cols-2 md:grid-cols-3 print:grid-cols-4 gap-2 text-xs">
                           {job.items.map((item, i) => (
                               <div key={i} className="flex items-start gap-1 border-b border-gray-800 pb-1 mb-1 print:border-gray-200 print:mb-0">
                                   <span className="font-bold bg-gray-700 text-cadena-blue px-1.5 rounded text-[10px] min-w-[1.2rem] text-center shrink-0 border border-gray-600 print:bg-gray-200 print:text-black print:border-gray-400">
                                       {item.quantity}
                                   </span>
                                   <span className="text-gray-300 leading-tight print:text-black text-[10px] break-words">{item.name}</span>
                               </div>
                           ))}
                       </div>

                   ) : (
                       <div className="text-center py-2 opacity-50 print:text-black">
                          {/* SI ES TEXTO VIEJO, LO MOSTRAMOS */}
                          {typeof job.items === 'string' && job.items.length > 1 ? (
                              <p className="text-xs italic text-gray-400 print:text-black">{job.items}</p>
                          ) : (
                              <p className="text-[10px] text-gray-500 italic print:text-black">Sin detalles</p>
                          )}
                       </div>
                   )}
                </div>

                {job.notes && (
                    <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg print:border print:border-black print:bg-transparent">
                        <p className="text-[10px] text-yellow-500 font-bold uppercase print:text-black inline mr-2">Nota:</p>
                        <span className="text-xs text-yellow-100/80 italic print:text-black">{job.notes}</span>
                    </div>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkOrder;