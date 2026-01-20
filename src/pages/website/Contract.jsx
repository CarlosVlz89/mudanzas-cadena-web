import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PenTool, CheckCircle, AlertTriangle } from 'lucide-react';

const Contract = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [moveData, setMoveData] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos de la mudanza
  useEffect(() => {
    const fetchMove = async () => {
      if (!id) return;
      const docRef = doc(db, "moves", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMoveData(docSnap.data());
      } else {
        alert("Contrato no encontrado");
      }
      setLoading(false);
    };
    fetchMove();
  }, [id]);

  // Lógica de dibujo (Canvas)
  const startDraw = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
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
    ctx.lineTo(x, y); ctx.stroke(); e.preventDefault(); // Evita scroll en celular
  };

  const saveSignature = async () => {
    const signatureImage = canvasRef.current.toDataURL();
    try {
      const docRef = doc(db, "moves", id);
      await updateDoc(docRef, {
        signature: signatureImage,
        status: 'Contrato Firmado',
        signedAt: new Date().toISOString()
      });
      alert("¡Contrato firmado con éxito!");
      navigate('/'); // Regresar al inicio
    } catch (error) {
      console.error(error);
      alert("Error al guardar firma");
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando contrato...</div>;
  if (!moveData) return <div className="p-10 text-center text-red-500">Enlace inválido.</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cadena-dark p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Contrato de Servicio</h1>
          <p className="opacity-80">Folio: {moveData.folio}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
            <p><strong>Cliente:</strong> {moveData.client}</p>
            <p><strong>Origen:</strong> {moveData.origin}</p>
            <p><strong>Destino:</strong> {moveData.destination}</p>
            <p><strong>Fecha:</strong> {moveData.date}</p>
            <p className="mt-2 text-xs">
              Al firmar, usted acepta los términos y condiciones de Mudanzas Cadena, incluyendo el seguro de carga y las políticas de cancelación.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-4 text-center">
            <p className="mb-2 text-gray-400 text-sm flex items-center justify-center gap-2">
              <PenTool size={16} /> Dibuja tu firma aquí (Dedo o Mouse)
            </p>
            <canvas 
              ref={canvasRef} 
              width={300} 
              height={150} 
              className="bg-white border rounded-lg shadow-sm mx-auto touch-none"
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
            />
            <button 
              onClick={() => {
                const c = canvasRef.current; 
                c.getContext('2d').clearRect(0,0,c.width,c.height);
              }} 
              className="text-xs text-red-400 underline mt-2"
            >
              Borrar y firmar de nuevo
            </button>
          </div>

          <button onClick={saveSignature} className="w-full bg-cadena-blue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-ocean-dark transition">
            Aceptar y Firmar Contrato
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contract;