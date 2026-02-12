import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase'; 
import { ArrowLeft, Printer, Share2, MapPin, Truck, User, Package, Calendar, FileText } from 'lucide-react';
import logo from '../../assets/images/logo.png'; 

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
          navigate('/app/dashboard'); 
        }
      } catch (error) {
        console.error("Error cargando orden:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMove();
  }, [id, navigate]);

  // Lógica para compartir en móviles
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Orden de Carga ${move.folio}`,
          text: `Orden de carga para ${move.client}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      alert("Enlace copiado al portapapeles");
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando formato...</div>;
  if (!move) return null;

  return (
    // CONFIGURACIÓN DE PÁGINA
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:bg-white print:p-0 font-sans print:text-black">
      
      {/* ESTILOS DE IMPRESIÓN */}
      <style>
        {`
          @media print {
            @page {
              margin: 0;
              size: letter;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: 100% !important;
            }
            body * {
              visibility: hidden;
            }
            #root, #root * {
              visibility: visible;
            }
            .print\\:bg-white {
              background-color: white !important;
              height: 100%;
              width: 100%;
              position: absolute;
              top: 0;
              left: 0;
            }
            /* Forzamos 3 columnas al imprimir */
            .print\\:columns-3 {
              column-count: 3 !important;
            }
          }
        `}
      </style>

      {/* BARRA DE NAVEGACIÓN */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap justify-between items-center print:hidden gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Volver</span>
        </button>
        
        <div className="flex gap-2">
            {/* BOTÓN COMPARTIR (Ideal para Móvil) */}
            <button 
              onClick={handleShare} 
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow-sm font-bold hover:bg-blue-200 transition"
            >
              <Share2 size={20} /> <span className="hidden sm:inline">Compartir</span>
            </button>

            {/* BOTÓN IMPRIMIR */}
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 bg-cadena-dark text-white px-6 py-2 rounded-lg shadow-md font-bold hover:bg-black transition"
            >
              <Printer size={20} /> <span className="hidden sm:inline">Imprimir</span>
            </button>
        </div>
      </div>

      {/* HOJA DE PAPEL */}
      <div className="max-w-[21.5cm] mx-auto bg-white shadow-2xl p-8 md:p-10 rounded-xl print:shadow-none print:w-full print:max-w-none print:p-8 print:rounded-none print:m-0 flex flex-col relative">
        
        {/* ENCABEZADO CON LOGO */}
        <div className="flex justify-between items-end border-b-4 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Mudanzas Cadena" className="h-16 w-auto object-contain" />
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-black leading-none">Orden de Carga</h1>
                <p className="text-gray-500 font-bold text-xs tracking-[0.3em] mt-1">MUDANZAS CADENA • LOGÍSTICA</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Folio de Servicio</p>
            <p className="text-3xl font-black text-red-600 leading-none">{move.folio || 'S/N'}</p>
            <div className="flex items-center justify-end gap-1 mt-1 text-gray-600">
               <Calendar size={12}/>
               <p className="text-xs font-bold">{move.date}</p>
            </div>
          </div>
        </div>

        {/* DATOS GENERALES */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm border-b border-gray-200 pb-6">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="flex flex-col gap-4">
            <div>
                <div className="flex items-center gap-2 font-black text-black mb-2 uppercase text-xs tracking-wider">
                   <User size={14}/> Cliente / Contacto
                </div>
                <div className="pl-2 border-l-2 border-cadena-blue">
                   <p className="text-lg font-bold uppercase leading-tight">{move.client}</p>
                   <p className="mt-0.5 text-gray-600 font-mono">{move.phone}</p>
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded p-2 print:bg-white print:border-black">
                <div className="flex items-center gap-1 mb-1 text-gray-500">
                    <FileText size={10} />
                    <p className="font-bold text-[9px] uppercase">Instrucciones de Oficina:</p>
                </div>
                <p className="uppercase text-xs font-bold text-black leading-snug">{move.notes || 'Sin instrucciones especiales.'}</p>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-3">
             <div>
                <h3 className="font-bold flex items-center gap-2 mb-0.5 text-[10px] text-gray-400 uppercase tracking-widest"><MapPin size={12}/> Origen</h3>
                <p className="uppercase text-black text-xs font-bold leading-snug border-l-2 border-green-500 pl-2">{move.origin}</p>
             </div>
             <div>
                <h3 className="font-bold flex items-center gap-2 mb-0.5 text-[10px] text-gray-400 uppercase tracking-widest"><Truck size={12}/> Destino</h3>
                <p className="uppercase text-black text-xs font-bold leading-snug border-l-2 border-red-500 pl-2">{move.destination}</p>
             </div>
          </div>
        </div>

        {/* INVENTARIO */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4 border-b border-black pb-1">
             <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                <Package size={16}/> Lista de Carga (Checklist)
             </h3>
             <span className="text-[10px] uppercase font-bold text-gray-400">Marcar al cargar</span>
          </div>
          
          {Array.isArray(move.items) && move.items.length > 0 ? (
            <div className="columns-1 md:columns-3 print:columns-3 gap-x-6 gap-y-2">
              {move.items.map((item, idx) => (
                <div key={idx} className="break-inside-avoid flex items-center gap-2 border-b border-gray-300 pb-1 mb-1 print:border-gray-400">
                  <div className="w-4 h-4 border-2 border-black rounded-sm shrink-0 bg-white"></div>
                  <span className="font-black text-sm text-black min-w-[1.2rem] text-center">{item.quantity}</span>
                  <span className="leading-tight uppercase text-[10px] font-bold text-gray-800 pt-0.5">{item.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400 italic border-2 border-dashed border-gray-200 rounded-lg">
               {typeof move.items === 'string' ? move.items : "No hay inventario desglosado en el sistema."}
            </div>
          )}
        </div>

        {/* FIRMAS */}
        <div className="mt-8 break-inside-avoid border-t-2 border-gray-100 pt-4 print:border-none">
           <div className="flex justify-between items-end text-center text-xs font-bold uppercase gap-8">
              <div className="w-1/2 border-t-2 border-black pt-2">
                 <p>Firma Operador</p>
                 <p className="text-[9px] text-gray-500 font-normal normal-case mt-1">Responsable de carga</p>
              </div>
              <div className="w-1/2 border-t-2 border-black pt-2">
                 <p>Firma Cliente</p>
                 <p className="text-[9px] text-gray-500 font-normal normal-case mt-1">Conformidad de servicio</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PrintOrder;