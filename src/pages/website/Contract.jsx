import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  PenTool, Printer, CheckCircle, UploadCloud, ShieldCheck, 
  Clock, FileText, Home, ArrowRight, MapPin 
} from 'lucide-react';

// Estilos para salto de página al imprimir
const pageBreakClass = "print:break-after-page print:min-h-screen print:flex print:flex-col print:justify-between relative bg-white shadow-lg p-12 mb-10 mx-auto max-w-[21.5cm] min-h-[27.9cm] text-gray-800 print:shadow-none print:m-0 print:w-full";

const Contract = () => {
  const { id } = useParams();
  const canvasRef = useRef(null);
  const [move, setMove] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "moves", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMove({ id: docSnap.id, ...data });
      } else { alert("Enlace no válido."); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  // --- COMPRESIÓN Y SUBIDA ---
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
    });
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageAsText = await compressImage(file);
      const updateData = type === 'ine' ? { idUrl: imageAsText } : { addressUrl: imageAsText };
      await updateDoc(doc(db, "moves", id), updateData);
    } catch (error) { console.error(error); alert("Error al subir imagen."); }
    setUploading(false);
  };

  // --- LÓGICA DE FIRMA (CALIBRADA) ---
  const getCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX,
      y: ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY
    };
  };

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e, canvas);
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(x, y); setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y); ctx.stroke();
    if(e.type !== 'mousemove') e.preventDefault();
  };

  const clearCanvas = () => {
    const c = canvasRef.current;
    c.getContext('2d').clearRect(0,0,c.width,c.height);
  };

  const saveSignature = async () => {
    if (!canvasRef.current) return;
    const empty = document.createElement('canvas');
    empty.width = canvasRef.current.width; empty.height = canvasRef.current.height;
    if (canvasRef.current.toDataURL() === empty.toDataURL()) {
        alert("Por favor firme antes de aceptar."); return;
    }
    const signatureImage = canvasRef.current.toDataURL();
    try {
      await updateDoc(doc(db, "moves", id), {
        signature: signatureImage,
        status: 'Contrato Firmado',
        signedAt: new Date()
      });
      alert("¡Contrato firmado correctamente!");
    } catch (error) { alert("Error al guardar firma"); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Cargando...</div>;
  if (!move) return <div className="min-h-screen flex items-center justify-center text-red-500">Enlace no válido.</div>;

  // Lógica de Vistas
  const missingIne = !move.idUrl;
  const missingAddress = !move.addressUrl;
  const isWaitingForApproval = !missingIne && !missingAddress && move.status === 'Pendiente';
  const isAuthorized = ['Programada', 'Contrato Firmado', 'En Carga', 'En Tránsito', 'Finalizada'].includes(move.status);

  let currentScreen = 'loading';
  if (missingIne) currentScreen = 'upload_ine';
  else if (missingAddress) currentScreen = 'upload_address';
  else if (isWaitingForApproval) currentScreen = 'waiting';
  else if (isAuthorized) {
    if (!hasReviewed && move.status !== 'Contrato Firmado') currentScreen = 'review_data';
    else currentScreen = 'contract';
  }

  // --- FOOTER DE FIRMA (CORREGIDO PARA CENTRAR) ---
  const SignatureFooter = () => (
    <div className="mt-auto pt-8 border-t border-gray-300 flex justify-between items-end text-xs">
       <div>
          <p className="font-bold">MUDANZAS CADENA</p>
          <p>Folio: {move.folio}</p>
       </div>
       {/* Bloque de firma Corregido */}
       <div className="flex flex-col items-center w-40"> 
          {move.signature ? (
            <img src={move.signature} className="h-12 object-contain -mb-2" alt="Firma" /> 
          ) : <div className="h-12"></div>}
          <div className="border-t border-black w-full text-center pt-1 font-bold">FIRMA C.</div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:bg-white print:p-0">
      
      {/* PANTALLAS PREVIAS (NO IMPRIMIR) */}
      <div className="max-w-xl mx-auto print:hidden">
        {currentScreen === 'upload_ine' && (
          <UploadScreen title="INE / Pasaporte" desc="Sube tu identificación oficial" icon={<FileText size={40} />} color="text-cadena-blue" bg="bg-blue-100" onChange={(e) => handleFileUpload(e, 'ine')} uploading={uploading} />
        )}
        {currentScreen === 'upload_address' && (
          <UploadScreen title="Comprobante de Domicilio" desc="Recibo de luz, agua o internet" icon={<Home size={40} />} color="text-cadena-pink" bg="bg-pink-100" onChange={(e) => handleFileUpload(e, 'address')} uploading={uploading} />
        )}
        {currentScreen === 'waiting' && (
          <div className="p-12 text-center bg-white rounded-3xl shadow-xl border-t-8 border-yellow-400">
            <Clock size={80} className="mx-auto text-yellow-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-bold">Validando Documentación</h2>
            <p className="text-gray-500 mt-4">Un asesor está revisando tu información. Te notificaremos por WhatsApp cuando el contrato esté listo.</p>
          </div>
        )}
        {currentScreen === 'review_data' && (
          <div className="p-8 bg-white rounded-3xl shadow-xl">
             <h2 className="text-2xl font-bold mb-4">Revisa los Datos Finales</h2>
             <div className="space-y-4 mb-6 text-sm">
                <p><strong>Cliente:</strong> {move.client}</p>
                <p><strong>Origen:</strong> {move.origin}</p>
                <p><strong>Destino:</strong> {move.destination}</p>
                <p className="text-xl font-black text-cadena-blue text-right">Total: ${move.price?.toLocaleString()}</p>
             </div>
             <button onClick={() => setHasReviewed(true)} className="w-full bg-cadena-dark text-white py-4 rounded-xl font-bold flex justify-center gap-2">
                Datos Correctos, Ver Contrato <ArrowRight />
             </button>
          </div>
        )}
      </div>

      {/* --- EL CONTRATO (Solo visible en paso final) --- */}
      {currentScreen === 'contract' && (
        <div className="max-w-[21.5cm] mx-auto">
          
          {/* --- PÁGINA 1: PORTADA Y DATOS --- */}
          <div className={pageBreakClass}>
            <div className="text-center border-b-4 border-cadena-pink pb-4 mb-8">
              <h1 className="text-4xl font-black italic tracking-tighter"><span className="text-black">M</span>UDANZAS <span className="text-cadena-pink">CADENA</span></h1>
              <p className="text-sm tracking-widest text-gray-500">LOGÍSTICA Y TRANSPORTE</p>
            </div>
            <div className="text-right mb-8">
              <p className="font-bold text-gray-600">CONTRATO DE SERVICIO</p>
              <p className="text-sm">FOLIO: <span className="text-red-500 font-bold">{move.folio}</span></p>
              <p className="text-sm uppercase">{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="space-y-6 text-sm uppercase">
               <div className="border p-4 rounded bg-gray-50">
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
               <div className="border-t pt-4">
                  <p><strong>NOTAS:</strong> {move.notes || 'Sin notas adicionales.'}</p>
                  <p className="mt-2"><strong>FECHA TENTATIVA DE CARGA:</strong> <span className="text-cadena-blue font-bold">{move.date || 'Por definir'}</span></p>
               </div>
            </div>
            <div className="mt-auto text-center font-bold text-xl text-gray-400 italic">COTIZA HOY, MÚDATE HOY</div>
            <SignatureFooter />
          </div>

          {/* --- PÁGINA 2: INVENTARIO --- */}
          <div className={pageBreakClass}>
            <h2 className="text-2xl font-bold text-center mb-6 border-b pb-2">INVENTARIO DECLARADO</h2>
            <div className="flex-1">
               <table className="w-full text-sm border-collapse">
                  <thead>
                     <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="text-left p-2">CANT.</th>
                        <th className="text-left p-2">DESCRIPCIÓN</th>
                     </tr>
                  </thead>
                  <tbody>
                     {move.items && move.items.length > 0 ? move.items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-200">
                           <td className="p-2 font-bold w-16">{item.quantity}</td>
                           <td className="p-2">{item.name}</td>
                        </tr>
                     )) : <tr><td colSpan="2" className="p-4 text-center text-gray-400 italic">Sin inventario desglosado.</td></tr>}
                  </tbody>
               </table>
            </div>
            <SignatureFooter />
          </div>

          {/* --- PÁGINA 3: CONDICIONES --- */}
          <div className={pageBreakClass}>
            <h2 className="text-xl font-bold text-center mb-4">CONDICIONES DEL SERVICIO</h2>
            <div className="text-[10px] leading-relaxed text-justify space-y-2 flex-1">
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
              <p>11. La empresa ofrece una póliza de seguro por el 5% adicional del valor total del servicio... En caso de no requerir el servicio de póliza de seguro, el cliente acepta que su mercancía viaje por cuenta y riesgo de el mismo.</p>
              <p>12. MUDANZAS CADENA se compromete a realizar la recolección y la entrega establecida por ambas partes.</p>
              <p>13. El cliente que es quien remite el servicio, encomienda a "MUDANZAS CADENA", y este se obliga a transportar en sujeción de las leyes...</p>
              <p>14. En caso de que el cliente requiera hacer algún cambio o cancelación, se podrá realizar siempre y cuando este sea 24 hrs antes de la hora en la que se agendó la recolección del servicio, de no ser así deberá pagar el 20% del costo total por los gastos de operación.</p>
              <p>15. No nos hacemos responsables de las cajas que se entreguen empacadas y selladas por la mano del mismo cliente, ya que desconocemos el contenido y el estado de lo que contenga el interior.</p>
              <p className="font-bold text-center mt-4">AL FIRMAR ESTE CONTRATO, ESTÁ ACEPTANDO LAS CONDICIONES DE SERVICIO ANTES MENCIONADAS.</p>
            </div>
            <SignatureFooter />
          </div>

          {/* --- PÁGINA 4: COSTOS --- */}
          <div className={pageBreakClass}>
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
             <div className="flex-1"></div>
             <SignatureFooter />
          </div>

          {/* --- PÁGINA 5: PAGOS --- */}
          <div className={pageBreakClass}>
             <h2 className="text-xl font-bold text-center mb-8">FORMAS DE PAGO / CONTACTO</h2>
             <div className="space-y-6 text-sm flex-1 text-center">
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
             <SignatureFooter />
          </div>

          {/* ZONA DE ACEPTACIÓN (PANTALLA) */}
          <div className="mt-8 mb-16 p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-3xl text-center print:hidden">
             {move.status !== 'Contrato Firmado' && !move.signature ? (
                <>
                   <h3 className="text-2xl font-bold text-cadena-dark mb-4">Aceptación del Contrato</h3>
                   <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                      Al firmar a continuación, confirmas que has leído todas las cláusulas, verificado el inventario y aceptas las condiciones del servicio.
                   </p>
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 max-w-md mx-auto mb-6 touch-none">
                      <p className="text-xs text-gray-400 mb-2 uppercase font-bold text-left">Dibuja tu firma:</p>
                      <canvas 
                        ref={canvasRef} width={300} height={150} 
                        className="w-full h-full cursor-crosshair border-b border-gray-300"
                        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
                      />
                      <button onClick={clearCanvas} className="text-xs text-red-500 underline w-full text-right mt-1">Borrar firma</button>
                   </div>
                   <button onClick={saveSignature} className="bg-cadena-blue text-white px-12 py-4 rounded-full font-bold shadow-xl hover:bg-blue-700 hover:scale-105 transition flex items-center gap-3 mx-auto">
                      <PenTool size={20}/> FIRMAR Y FINALIZAR
                   </button>
                </>
             ) : (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200 inline-block">
                   <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto mb-4"><CheckCircle size={40} /></div>
                   <h3 className="text-2xl font-bold text-green-800 mb-2">¡Contrato Firmado!</h3>
                   <p className="text-green-700 mb-6">Tu mudanza está 100% confirmada.</p>
                   <button onClick={() => window.print()} className="bg-cadena-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-black transition">
                      <Printer size={20}/> Descargar PDF Firmado
                   </button>
                </div>
             )}
          </div>

        </div>
      )}
    </div>
  );
};

// COMPONENTE DE SUBIDA
const UploadScreen = ({ title, desc, icon, color, bg, onChange, uploading }) => (
  <div className="p-8 text-center bg-white rounded-3xl shadow-xl">
     <div className={`w-20 h-20 ${bg} ${color} rounded-full flex items-center justify-center mx-auto mb-6`}>{icon}</div>
     <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
     <p className="text-gray-500 mb-8">{desc}</p>
     <label className={`block w-full border-2 border-dashed rounded-2xl p-10 cursor-pointer hover:bg-gray-50 transition ${uploading ? 'opacity-50' : ''}`}>
        <input type="file" className="hidden" accept="image/*" onChange={onChange} disabled={uploading} />
        <UploadCloud className={`mx-auto ${color} mb-4`} size={48} />
        <span className="font-bold text-gray-600">{uploading ? 'Procesando...' : 'Toca para subir foto'}</span>
     </label>
  </div>
);

export default Contract;