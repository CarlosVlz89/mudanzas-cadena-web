import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <--- IMPORTANTE: Importar Link
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import mascota from '../../assets/images/mascota.png'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Fondos decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cadena-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cadena-pink/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white relative z-10">
        
        {/* ENCABEZADO CON MASCOTA */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg overflow-hidden">
             <img src={mascota} alt="Admin" className="w-full h-full object-cover object-top pt-2 scale-110" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Acceso Administrativo</h2>
          <p className="text-slate-500 text-sm">Ingresa tus credenciales para gestionar.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold flex items-center gap-2 mb-6 border border-red-100">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-cadena-blue" size={20} />
              <input 
                type="email" 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-cadena-blue focus:bg-white outline-none transition font-medium text-slate-700"
                placeholder="e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-cadena-pink" size={20} />
              <input 
                type="password" 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-cadena-pink focus:bg-white outline-none transition font-medium text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-cadena-dark text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition transform active:scale-95">
            Entrar al Sistema
          </button>
        </form>

        {/* --- AQUÍ ESTÁ EL ARREGLO DEL BOTÓN --- */}
        {/* Usamos <Link to="/"> en vez de <a href="/"> */}
        <div className="mt-8 text-center">
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