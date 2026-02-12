import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase'; 
import { ArrowLeft, Printer, Share2 } from 'lucide-react';
import logo from '../../assets/images/logo.png'; 

const AdminContractView = () => {
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
          let data = docSnap.data();
          if (data.idUrl && !data.idUrlFront) data.idUrlFront = data.idUrl;
          setMove({ id: docSnap.id, ...data });
        } else {
          alert("Contrato no encontrado");
          navigate('/admin'); 
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMove();
  }, [id, navigate]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Contrato ${move.folio}`,
          text: `Contrato de servicio para ${move.client}`,
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

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando contrato...</div>;
  if (!move) return null;

  // Estilos de hoja
  const pageClass = "bg-white shadow-2xl p-10 mx-auto max-w-[21.5cm] min-h-[27.9cm] text-black text-sm flex flex-col mb-8 last:mb-0 print:shadow-none print:m-0 print:w-full print:max-w-none print:min-h-[27.9cm] print:h-[27.9cm] print:break-after-page print:mb-0 print:rounded-none relative";

  const SignatureFooter = () => (
    <div className="pt-8 border-t border-gray-300 flex justify-between items-end text-xs break-inside-avoid">
       <div>
          <p className="font-bold text-black">MUDANZAS CADENA</p>
          <p className="text-black">Folio: {move.folio}</p>
       </div>
       <div className="flex flex-col items-center w-40"> 
          {move.signature ? (
            <img src={move.signature} className="h-12 object-contain -mb-2" alt="Firma" /> 
          ) : <div className="h-12"></div>}
          <div className="border-t border-black w-full text-center pt-1 font-bold text-black">FIRMA C.</div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:bg-white print:p-0 font-sans">
      
      {/* --- ESTILOS DE IMPRESIÓN --- */}
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
              background-color: white !important;
            }
            body * {
              visibility: hidden;
            }
            #root, #root * {
              visibility: visible;
            }
            .print\\:bg-white {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
            }
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
            <button 
              onClick={handleShare} 
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow-sm font-bold hover:bg-blue-200 transition"
            >
              <Share2 size={20} /> <span className="hidden sm:inline">Compartir</span>
            </button>

            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 bg-cadena-dark text-white px-6 py-2 rounded-lg shadow-md font-bold hover:bg-black transition"
            >
              <Printer size={20} /> <span className="hidden sm:inline">Imprimir Contrato</span>
            </button>
        </div>
      </div>

      {/* --- PÁGINA 1: PORTADA --- */}
      <div className={pageClass}>
        <div className="flex justify-between items-end border-b-4 border-cadena-pink pb-4 mb-8">
          <div className="flex flex-col items-start">
            <img src={logo} alt="Mudanzas Cadena" className="h-24 object-contain object-left -ml-3" />
            <p className="text-xs tracking-[0.2em] font-bold uppercase mt-1 ml-1 text-gray-500">
              COTIZA HOY, MÚDATE HOY
            </p>
          </div>
          <div className="text-right">
            <p className="font-black text-lg">CONTRATO DE SERVICIO</p>
            <p className="text-sm">FOLIO: <span className="text-red-600 font-black text-xl">{move.folio}</span></p>
            <p className="text-xs font-bold uppercase text-cadena-blue mt-1">
              {new Date(move.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm uppercase mb-12">
            <div className="border p-4 rounded bg-gray-50 border-gray-200">
              <p><strong>CLIENTE:</strong> {move.client}</p>
              <p><strong>TELÉFONO:</strong> {move.phone}</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                  <h3 className="font-bold border-b border-gray-300 mb-2">ORIGEN</h3>
                  <p>{move.origin}</p>
              </div>
              <div>
                  <h3 className="font-bold border-b border-gray-300 mb-2">DESTINO</h3>
                  <p>{move.destination}</p>
              </div>
            </div>
            <div className="border-t pt-4 border-gray-200">
              <p><strong>NOTAS:</strong> {move.notes || 'Sin notas adicionales.'}</p>
              <p className="mt-2"><strong>FECHA TENTATIVA DE CARGA:</strong> <span className="text-cadena-blue font-bold">{move.date || 'Por definir'}</span></p>
            </div>
        </div>
        
        <SignatureFooter />
      </div>

      {/* --- PÁGINA 2: INVENTARIO --- */}
      <div className={pageClass}>
        <div>
          <h2 className="text-2xl font-bold text-center mb-2">INVENTARIO DECLARADO</h2>
          <p className="text-center text-xs text-gray-400 mb-6 uppercase tracking-widest border-b border-gray-200 pb-4">
            Revisado y Autorizado por el Cliente
          </p>
          <div className="flex-1 mb-8">
            {move.items && move.items.length > 0 ? (
              <div className="columns-2 md:columns-3 print:columns-3 gap-4">
                  {move.items.map((item, i) => (
                    <div key={i} className="break-inside-avoid mb-2 border-b border-gray-100 pb-1 flex items-center gap-2 text-sm">
                        <span className="font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs min-w-[2rem] text-center border border-gray-200">
                          {item.quantity}
                        </span>
                        <span className="leading-tight">{item.name}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400 italic">Sin inventario desglosado en sistema.</p>
              </div>
            )}
          </div>
        </div>
        <SignatureFooter />
      </div>

      {/* --- PÁGINA 3: CONDICIONES --- */}
      <div className={pageClass}>
        <div className="mb-8">
          <h2 className="text-xl font-bold text-center mb-4">CONDICIONES DEL SERVICIO</h2>
          <p>1. Se deberá realizar un anticipo del 50% para poder confirmar su servicio.</p>
              <p>2. El valor total a pagar debe ser liquidado al momento que la unidad se encuentre en el destino para poder comenzar con la descarga.</p>
              <p>3. El valor del flete incluye maniobras de carga y descarga.</p>
              <p>4. El valor del flete incluye cubierta a muebles con hule poliestrech y protección con colchonetas a bordo de la unidad de transporte.</p>
              <p>5. Se deberán de marcar las cajas que sean frágiles y de igual manera informárselo al operador para tener un cuidado especial de las mismas.</p>
              <p>6. Todos los muebles están susceptibles a daños, en caso de requerir un empaque especializado para su mayor protección, tendrá un costo adicional.</p>
              <p>7. Al firmar este contrato el C. se hace responsable de las pertenencias que entregue al operador, desde el momento de la carga hasta la descarga. Todos los artículos "empacados por el cliente" viajan por cuenta y riesgo, esto quiere decir, que no nos haremos responsables por las condiciones en las que lleguen a su destino, debido a que desconocemos el contenido y condiciones de origen de estas, no se aceptan reclamaciones.</p>
              <p>8. Queda prohibido transportar animales vivos o muertos, armas de fuego, sustancias toxicas y plantas.</p>
              <p>9. En caso de salir menaje extra a la hora de la carga se realizará la modificación de su cotización.</p>
              <p>10. En caso que se requieran realizar maniobras extras no reportadas por el cliente, se cobrarán por separado.</p>
              <p>11. La empresa ofrece una póliza de seguro por el 5% adicional del valor total del servicio, de $50,000.00 como valor mínimo de
                  embarque para la modalidad compartida o una póliza de seguro por el 10% adicional del valor de total del servicio, de $50,000.00
                  hasta $100,000.00 como límite máximo por embarque para la modalidad exclusiva, por los hechos que la ley señala como riesgos
                  ordinarios de tránsito, robo total con violencia y/o asalto. En caso de que el valor declarado de sus bienes exceda estos montos, se
                  le da la opción al cliente de ampliar su póliza de seguro para que su carga vaya asegurada por completo. La territorialidad de la
                  póliza de seguro consta de (Bodega – Bodega), es decir, desde el momento que sale de Bodega MUDANZAS CADENA hasta el
                  DESTINO FINAL del cliente. La Póliza de Seguro compartida y exclusiva se considera por todo el embarque, es decir, sobre todos los
                  artículos, embalajes, que viajen en el mismo contenedor, bajo ninguna circunstancia se contrata el seguro por un artículo u embalaje
                  en especial. En caso de no requerir el servicio de póliza de seguro, el cliente acepta que su mercancía viaje por cuenta y riesgo de el
                  mismo.</p>
              <p>12. MUDANZAS CADENA se compromete a realizar la recolección y la entrega establecida por ambas partes.</p>
              <p>13. El cliente que es quien remite el servicio, encomienda a “MUDANZAS CADENA”, y este se obliga a transportar en sujeción de las leyes, aquellos bienes descritos en el presente documento al lugar del destino que señale el cliente.</p>
              <p>14. En caso de que el cliente requiera hacer algún cambio o cancelación, se podrá realizar siempre y cuando este sea 24 hrs antes de la hora en la que se agendó la recolección del servicio, de no ser así deberá pagar el 20% del costo total por los gastos de operación.</p>
              <p>15. No nos hacemos responsables de las cajas que se entreguen empacadas y selladas por la mano del mismo cliente, ya que desconocemos el contenido y el estado de lo que contenga el interior.</p>
        </div>
        <SignatureFooter />
      </div>

      {/* --- PÁGINA 4: COSTOS --- */}
      <div className={pageClass}>
         <div className="mb-8">
            <h2 className="text-xl font-bold text-center mb-8">COSTO DEL SERVICIO</h2>
            <table className="w-full border-2 border-black mb-8 text-sm">
                <thead>
                    <tr className="bg-gray-200 border-b-2 border-black">
                      <th className="p-2 border-r border-black w-1/2">SERVICIO / CONCEPTO</th>
                      <th className="p-2 border-r border-black">COSTO U.</th>
                      <th className="p-2 border-r border-black">CANT.</th>
                      <th className="p-2">SUBTOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {move.financialItems && move.financialItems.length > 0 ? (
                      move.financialItems.map((item, idx) => (
                          <tr key={idx} className="border-b border-black">
                            <td className="p-4 border-r border-black align-top whitespace-pre-wrap">{item.description}</td>
                            <td className="p-4 border-r border-black align-top text-center">${Number(item.cost).toLocaleString()}</td>
                            <td className="p-4 border-r border-black align-top text-center">{item.quantity}</td>
                            <td className="p-4 align-top text-center font-bold">${(item.cost * item.quantity).toLocaleString()}</td>
                          </tr>
                      ))
                    ) : (
                      <tr>
                          <td className="p-4 border-r border-black align-top h-40">
                            {move.serviceDescription || "SERVICIO DE FLETE EXCLUSIVO..."}
                          </td>
                          <td className="p-4 border-r border-black align-top text-center">${move.subtotal?.toLocaleString()}</td>
                          <td className="p-4 border-r border-black align-top text-center">1</td>
                          <td className="p-4 align-top text-center">${move.subtotal?.toLocaleString()}</td>
                      </tr>
                    )}
                </tbody>
            </table>
            <div className="w-1/2 ml-auto">
                <div className="flex justify-between border-b border-gray-300 py-1"><span>SUBTOTAL</span> <span>${move.subtotal?.toLocaleString()}</span></div>
                <div className="flex justify-between border-b border-gray-300 py-1"><span>IVA (16%)</span> <span>${move.iva?.toLocaleString()}</span></div>
                <div className="flex justify-between border-b border-gray-300 py-1 text-red-500"><span>RETENCIÓN (-4%)</span> <span>- ${move.retention?.toLocaleString()}</span></div>
                <div className="flex justify-between border-t-2 border-black py-2 font-black text-lg mt-2"><span>TOTAL</span> <span>${move.price?.toLocaleString()}</span></div>
            </div>
         </div>
         <SignatureFooter />
      </div>

      {/* --- PÁGINA 5: PAGOS --- */}
      <div className={pageClass}>
         <div className="mb-8">
            <h2 className="text-xl font-bold text-center mb-8">FORMAS DE PAGO / CONTACTO</h2>
            <div className="space-y-6 text-sm text-center">
                <p className="font-bold">SE DEBERÁ REALIZAR UN ANTICIPO DEL 50% PARA PODER CONFIRMAR SU SERVICIO Y DEBE SER LIQUIDADO AL MOMENTO QUE LA UNIDAD SE ENCUENTRE EN EL DESTINO PARA PODER COMENZAR CON LA DESCARGA.</p>
                <div className="border-2 border-cadena-blue p-6 rounded-xl">
                  <h3 className="font-black text-lg text-blue-800 mb-2">CITIBANAMEX</h3>
                  <p>CAROLINA SARAI CADENA HERNANDEZ</p>
                  <p className="font-mono font-bold text-lg">CLABE: 0021 8070 1057 3228 51</p>
                </div>
                <div className="border-2 border-cadena-blue p-6 rounded-xl">
                  <h3 className="font-black text-lg text-blue-800 mb-2">FACTURACIÓN (BBVA)</h3>
                  <p>JONATAN SAMUEL CADENA HERNANDEZ</p>
                  <p>CUENTA: 047 181 9445</p>
                  <p className="font-mono font-bold text-lg">CLABE: 0121 8000 4718 194455</p>
                </div>
                <p className="text-xs text-gray-500 mt-8">
                  UNA VEZ REALIZADO EL DEPÓSITO ENVIAR COMPROBANTE A: mudanzascadenamx@gmail.com <br/> O WHATSAPP: 55 7945 3056 ADJUNTADO CON UNA COPIA DE UNA IDENTIFICACIÓN OFICIAL VIGENTE.
                </p>
            </div>
         </div>
         <SignatureFooter />
      </div>

    </div>
  );
};

export default AdminContractView;