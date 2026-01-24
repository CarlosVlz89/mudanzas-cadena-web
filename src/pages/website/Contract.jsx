import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PenTool, Printer, CheckCircle, UploadCloud, ShieldCheck, Clock, Image as ImageIcon } from 'lucide-react';

const Contract = () => {
  const { id } = useParams();
  const canvasRef = useRef(null);
  const [moveData, setMoveData] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "moves", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMoveData(docSnap.data());
      } else {
        alert("Enlace no válido.");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  // --- COMPRESIÓN DE IMAGEN (Para guardar gratis en la BD) ---
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageAsText = await compressImage(file);
      await updateDoc(doc(db, "moves", id), { idUrl: imageAsText });
      alert("Identificación enviada con éxito.");
    } catch (error) { alert("Error al procesar imagen."); }
    setUploading(false);
  };

  // --- LÓGICA DE FIRMA ---
  const startDraw = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath(); ctx.moveTo(x, y); setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y); ctx.stroke(); e.preventDefault();
  };

  const clearCanvas = () => {
    const c = canvasRef.current;
    c.getContext('2d').clearRect(0,0,c.width,c.height);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    const empty = document.createElement('canvas');
    empty.width = canvas.width; empty.height = canvas.height;
    if (canvas.toDataURL() === empty.toDataURL()) {
      alert("Por favor firme el documento antes de aceptar.");
      return;
    }

    const signatureImage = canvas.toDataURL();
    try {
      const docRef = doc(db, "moves", id);
      await updateDoc(docRef, {
        signature: signatureImage,
        status: 'Contrato Firmado',
        signedAt: new Date().toISOString()
      });
      alert("¡Contrato firmado correctamente!");
    } catch (error) { alert("Error al guardar firma"); }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Cargando...</div>;

  // CONTROL DE VISTAS SEGÚN EL ESTADO
  const showUpload = !moveData.idUrl; 
  const showWaiting = moveData.idUrl && moveData.status === 'Pendiente';
  const showContract = moveData.idUrl && moveData.status !== 'Pendiente';

  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4 print:bg-white print:p-0">
      
      {/* 1. VISTA DE SUBIDA DE IDENTIFICACIÓN */}
      {showUpload && (
        <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl text-center mt-10">
          <ShieldCheck size={60} className="mx-auto text-blue-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Validación de Identidad</h2>
          <p className="text-gray-500 mb-8 text-sm">Antes de proceder con el contrato legal, requerimos una fotografía de su identificación oficial (INE o Pasaporte) para verificar sus datos.</p>
          <label className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition cursor-pointer ${uploading ? 'bg-gray-400' : 'bg-cadena-blue hover:bg-ocean-dark shadow-lg'}`}>
            <UploadCloud /> {uploading ? 'Procesando...' : 'Subir Foto de Identificación'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      )}

      {/* 2. VISTA DE ESPERA DE VALIDACIÓN */}
      {showWaiting && (
        <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl text-center mt-10 border-t-8 border-yellow-400">
          <Clock size={60} className="mx-auto text-yellow-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Validando Datos</h2>
          <p className="text-gray-600 mb-6 text-sm">Hemos recibido su identificación. Un asesor de <strong>Mudanzas Cadena</strong> está revisando la información para generar su contrato final.</p>
          <div className="bg-yellow-50 p-4 rounded-lg text-xs text-yellow-800 italic">
            "Le notificaremos vía WhatsApp en cuanto el contrato esté listo para su firma digital."
          </div>
        </div>
      )}

      {/* 3. VISTA DEL CONTRATO FORMAL (Tu diseño favorito) */}
      {showContract && (
        <>
          <div className="max-w-[21cm] mx-auto mb-6 flex justify-between items-center print:hidden">
            <h1 className="text-xl font-bold text-gray-700">Contrato de Servicio Digital</h1>
            {moveData.signature && (
              <button onClick={() => window.print()} className="bg-cadena-dark text-white px-4 py-2 rounded-lg flex gap-2 font-bold shadow hover:bg-black transition">
                <Printer size={20} /> Imprimir / Guardar PDF
              </button>
            )}
          </div>

          <div className="max-w-[21cm] mx-auto bg-white shadow-2xl p-12 min-h-[29.7cm] text-justify text-sm leading-relaxed text-gray-800 print:shadow-none print:w-full print:max-w-none">
            
            {/* ENCABEZADO */}
            <div className="flex justify-between items-start border-b-2 border-cadena-blue pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-cadena-blue uppercase tracking-widest">Mudanzas Cadena</h2>
                <p className="text-xs text-gray-500">Servicios Logísticos y de Transporte</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-red-500">FOLIO: {moveData.folio}</p>
                <p className="text-xs">Fecha: {new Date(moveData.createdAt?.seconds * 1000).toLocaleDateString()}</p>
              </div>
            </div>

            <h3 className="text-center font-bold text-lg mb-4 uppercase underline">Contrato de Prestación de Servicios de Mudanza</h3>

            <p className="mb-4 text-xs">
              CONTRATO DE PRESTACIÓN DE SERVICIOS QUE CELEBRAN POR UNA PARTE <strong>MUDANZAS CADENA</strong> (EL "PRESTADOR") Y POR LA OTRA PARTE <strong>{moveData.client.toUpperCase()}</strong> (EL "CLIENTE"), BAJO LAS SIGUIENTES:
            </p>

            <h4 className="font-bold text-xs mt-4 mb-2">CLÁUSULAS</h4>

            <p className="mb-2 text-xs">
              <strong>PRIMERA (OBJETO):</strong> Transporte de bienes desde <u>{moveData.origin}</u> hasta <u>{moveData.destination}</u>.
            </p>
            <p className="mb-2 text-xs">
              <strong>SEGUNDA (FECHA):</strong> El servicio se llevará a cabo el día <strong>{moveData.date}</strong>.
            </p>
            <p className="mb-2 text-xs">
              <strong>TERCERA (COSTO):</strong> El precio pactado es de <strong>${moveData.price?.toLocaleString()} MXN</strong>.
            </p>

            {/* INVENTARIO DINÁMICO */}
            <div className="mt-6 mb-6 p-4 border border-gray-300 rounded bg-gray-50">
              <h4 className="font-bold text-center mb-2 text-cadena-blue border-b border-gray-300 pb-1 text-xs">INVENTARIO DECLARADO</h4>
              {moveData.items && Array.isArray(moveData.items) && moveData.items.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  {moveData.items.map((item, index) => (
                    <div key={index} className="flex justify-between border-b border-gray-200 py-1">
                      <span>• {item.name}</span><span className="font-bold">{item.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center italic text-[10px]">Inventario General</p>}
              {moveData.notes && <p className="mt-3 text-[10px] italic"><strong>Notas adicionales:</strong> {moveData.notes}</p>}
            </div>

            {/* ANEXO INE (Se imprime en el contrato) */}
            <div className="mt-6 pt-6 border-t border-gray-200 break-inside-avoid">
               <p className="font-bold text-[10px] mb-2 uppercase text-gray-400">Anexo: Identificación Oficial Adjunta</p>
               <img src={moveData.idUrl} className="h-32 object-contain grayscale opacity-70 border" alt="Anexo ID" />
            </div>

            {/* ÁREA DE FIRMAS */}
            <div className="mt-10 flex justify-around items-end break-inside-avoid">
              <div className="text-center w-1/3">
                <div className="mb-2 font-serif italic text-lg text-blue-900">Mudanzas Cadena</div>
                <div className="border-t border-black pt-2 font-bold text-[10px] uppercase">Prestador</div>
              </div>

              <div className="text-center w-1/3 flex flex-col items-center">
                {moveData.signature ? (
                  <img src={moveData.signature} alt="Firma Cliente" className="h-16 mb-[-10px] object-contain" />
                ) : (
                  <div className="print:hidden mb-2">
                     <canvas ref={canvasRef} width={200} height={100} 
                      className="bg-gray-50 border-2 border-dashed border-blue-300 rounded cursor-crosshair touch-none"
                      onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                      onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
                    />
                    <button onClick={clearCanvas} className="text-[9px] text-red-500 underline block w-full text-right mt-1">Borrar firma</button>
                  </div>
                )}
                <div className="border-t border-black pt-2 font-bold text-[10px] uppercase w-full">Firma del Cliente</div>
              </div>
            </div>

            {/* BOTÓN FINAL DE FIRMA */}
            {!moveData.signature && (
              <div className="mt-12 text-center print:hidden">
                <button onClick={saveSignature} className="bg-cadena-blue text-white px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition flex items-center gap-2 mx-auto">
                  <PenTool /> FIRMAR CONTRATO ACEPTADO
                </button>
              </div>
            )}

            {moveData.signature && (
              <div className="mt-8 text-center print:hidden bg-green-50 p-4 rounded-xl border border-green-200">
                <CheckCircle size={32} className="mx-auto text-green-600 mb-2"/>
                <h3 className="font-bold text-green-800">Contrato Firmado</h3>
                <p className="text-xs text-green-700">El documento ha sido validado y guardado.</p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="text-center text-gray-400 text-[10px] mt-8 print:hidden">
        Sistema de Gestión Legal - Mudanzas Cadena &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default Contract;