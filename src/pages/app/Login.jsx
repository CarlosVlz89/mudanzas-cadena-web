import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'; // Importamos Google Auth
import { auth } from '../../config/firebase';
import { ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import mascota from '../../assets/images/mascota.png'; 

// --- LISTA BLANCA DE CORREOS PERMITIDOS ---
const ALLOWED_EMAILS = [
  "mudanzascadenamx@gmail.com",
  "carlos.mtzvelez@gmail.com"
];

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // --- VALIDACIÓN DE SEGURIDAD ---
      if (ALLOWED_EMAILS.includes(user.email)) {
        // Si el correo está en la lista, ¡Pasa!
        navigate('/admin/dashboard');
      } else {
        // Si no está en la lista, lo sacamos inmediatamente
        await signOut(auth);
        setError('Acceso denegado. Tu correo no tiene permisos de administrador.');
      }

    } catch (err) {
      console.error(err);
      setError('Error al conectar con Google. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Fondos decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cadena-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cadena-pink/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white relative z-10 text-center">
        
        {/* ENCABEZADO CON MASCOTA */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-cadena-blue/20 to-transparent"></div>
             <img src={mascota} alt="Admin" className="w-full h-full object-cover object-top pt-2 scale-110" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Acceso Administrativo</h2>
          <p className="text-slate-500 text-sm mt-1">Panel de control exclusivo para personal autorizado.</p>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold flex items-start gap-3 mb-6 border border-red-100 text-left animate-pulse">
            <AlertCircle size={20} className="shrink-0 mt-0.5" /> 
            <span>{error}</span>
          </div>
        )}

        {/* BOTÓN DE GOOGLE */}
        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-slate-100 text-slate-700 py-4 rounded-xl font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition transform active:scale-95 flex items-center justify-center gap-3 group"
          >
            {/* Icono de Google SVG */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Verificando...' : 'Iniciar Sesión con Google'}
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
             <ShieldCheck size={14}/> Acceso protegido y monitoreado.
          </div>
        </div>

        {/* BOTÓN VOLVER */}
        <div className="mt-10 border-t border-slate-100 pt-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cadena-blue font-bold text-sm transition"
          >
            <ArrowLeft size={16} /> Volver al sitio web
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;