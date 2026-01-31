import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Ajusta si tu config está en otro nivel
import { ArrowLeft, Printer, MapPin, Truck, User } from 'lucide-react';

const PrintOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [move, setMove] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMove = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "moves", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setMove({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Orden no encontrada");
          navigate('/app/dashboard'); // Regresamos al dashboard si falla
        }
      } catch (error) {
        console.error("Error cargando orden:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMove();
  }, [id, navigate]);

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando formato...</div>;
  if (!move) return null;

  return (
    // Fondo gris en pantalla, Fondo blanco al imprimir
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:bg-white print:p-0 font-sans">
      
      {/* --- BARRA DE NAVEGACIÓN (Se oculta al imprimir) --- */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate(-1)} // <--- ESTO SOLUCIONA EL PROBLEMA DE "REGRESAR"
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          <ArrowLeft size={20} /> Volver al Tablero
        </button>
        
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 bg-cadena-dark text-white px-6 py-2 rounded-lg shadow-md font-bold hover:bg-black transition"
        >
          <Printer size={20} /> Imprimir / PDF
        </button>
      </div>

      {/* --- HOJA DE PAPEL (Formato Carta) --- */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl p-8 md:p-12 rounded-xl print:shadow-none print:w-full print:max-w-none print:p-0 print:rounded-none">
        
        {/* Encabezado */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-black">Orden de Carga</h1>
            <p className="text-gray-500 font-bold text-sm tracking-widest">MUDANZAS CADENA • LOGÍSTICA</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold">Folio de Servicio</p>
            <p className="text-2xl font-black text-red-600">{move.folio || 'S/N'}</p>
            <p className="text-xs mt-1 text-gray-400">Fecha Impresión: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Datos Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-sm">
          {/* Cliente */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 print:border-black print:bg-transparent">
            <div className="flex items-center gap-2 font-bold text-cadena-blue mb-2 print:text-black">
               <User size={18}/> DATOS DEL CLIENTE
            </div>
            <p className="text-lg font-bold uppercase">{move.client}</p>
            <p className="mt-1">Tel: {move.phone}</p>
            <p className="mt-1">Fecha Programada: <span className="font-bold">{move.date}</span></p>
          </div>

          {/* Ruta */}
          <div className="space-y-4">
             <div>
                <h3 className="font-bold flex items-center gap-2 mb-1 text-xs text-gray-400 uppercase tracking-widest"><MapPin size={14}/> Origen</h3>
                <p className="uppercase text-gray-800 leading-snug font-medium border-l-4 border-green-400 pl-3">{move.origin}</p>
             </div>
             <div>
                <h3 className="font-bold flex items-center gap-2 mb-1 text-xs text-gray-400 uppercase tracking-widest"><Truck size={14}/> Destino</h3>
                <p className="uppercase text-gray-800 leading-snug font-medium border-l-4 border-red-400 pl-3">{move.destination}</p>
             </div>
          </div>
        </div>

        {/* Tabla de Inventario */}
        <div className="mb-8">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-3 border-b pb-1">Inventario Declarado</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200 text-xs uppercase">
                <th className="p-2 text-center w-16 border border-gray-300">Cant.</th>
                <th className="p-2 text-left border border-gray-300">Descripción</th>
                <th className="p-2 text-center w-24 border border-gray-300 print:border-black">Check</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(move.items) && move.items.length > 0 ? (
                move.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 text-center font-bold border border-gray-300">{item.quantity}</td>
                    <td className="p-2 uppercase border border-gray-300">{item.name}</td>
                    <td className="p-2 border border-gray-300 print:border-black"></td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="3" className="p-6 text-center text-gray-400 italic border border-gray-300">
                     No hay inventario desglosado en el sistema.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Observaciones y Firmas */}
        <div className="mt-auto">
           <div className="border border-gray-300 p-3 rounded mb-16 min-h-[80px]">
              <p className="font-bold text-[10px] uppercase text-gray-400 mb-1">Notas / Observaciones:</p>
              <p className="uppercase text-sm">{move.notes || 'Sin observaciones adicionales.'}</p>
           </div>

           <div className="flex justify-between items-end text-center text-xs font-bold uppercase">
              <div className="w-5/12 border-t border-black pt-2">Firma Operador</div>
              <div className="w-5/12 border-t border-black pt-2">Firma Cliente (Conformidad)</div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PrintOrder;