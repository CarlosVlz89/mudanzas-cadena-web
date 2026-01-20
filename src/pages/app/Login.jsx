import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase'; // Importamos nuestra config
import { Lock, Truck, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // INTENTO DE LOGIN CON FIREBASE
      await signInWithEmailAndPassword(auth, email, password);
      // Si funciona, redirigir al Dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Cabecera Azul */}
        <div className="bg-cadena-dark p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Truck className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Acceso Administrativo</h2>
          <p className="text-gray-400 text-sm mt-2">Sistema Integral SwiftMove</p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Mensaje de Error */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Corporativo</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cadena-blue focus:border-cadena-blue outline-none transition"
                placeholder="admin@empresa.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cadena-blue focus:border-cadena-blue outline-none transition"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute right-3 top-3.5 text-gray-400" size={20} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-cadena-blue hover:bg-ocean-dark text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-cadena-blue transition">
              ← Volver al sitio web
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;