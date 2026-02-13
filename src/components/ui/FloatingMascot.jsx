import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // 1. Importamos useLocation
import mascota from '../../assets/images/mascota.png'; 

const FloatingMascot = () => {
  const { pathname } = useLocation(); // 2. Obtenemos la ruta actual
  const [isVisible, setIsVisible] = useState(false);

  // 3. LISTA NEGRA: Aquí pones las rutas donde NO quieres que salga
  const hiddenRoutes = ['/cotizar', '/rastreo'];

  // Si la ruta actual está en la lista negra, no renderizamos nada (return null)
  const shouldHide = hiddenRoutes.includes(pathname);

  useEffect(() => {
    // Solo activamos la animación si NO debemos escondernos
    if (!shouldHide) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldHide]); // Agregamos shouldHide a la dependencia

  // 4. EL PASO MÁGICO: Si debe esconderse, retornamos null (no dibuja nada)
  if (shouldHide) return null;

  return (
    <Link
      to="/cotizar"
      className={`fixed bottom-6 right-6 z-[60] flex flex-col items-end cursor-pointer group transition-transform duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
    >
      
      {/* 1. GLOBITO DE TEXTO */}
      <div className="relative mr-4 mb-2 animate-bounce-slow">
        <div className="bg-white text-cadena-dark font-bold text-sm px-4 py-2 rounded-2xl shadow-xl border border-gray-100 transform transition-transform origin-bottom-right group-hover:scale-110">
          ¡Psst! ¿Cotizamos? 📦
        </div>
        {/* Triángulo del globo */}
        <div className="absolute -bottom-1 right-4 w-3 h-3 bg-white border-r border-b border-gray-100 transform rotate-45"></div>
      </div>

      {/* 2. LA MASCOTA */}
      <div className="relative w-20 h-20 md:w-32 md:h-32 transition-all duration-300">
        
        {/* Efecto de 'Aura' */}
        <div className="absolute inset-0 bg-cadena-blue/30 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
        
        {/* Imagen */}
        <img
          src={mascota}
          alt="Cotiza con nosotros"
          className="w-full h-full object-contain drop-shadow-2xl transform transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-6"
        />

        {/* Notificación (Puntito rojo) */}
        <span className="absolute top-0 right-0 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>
      </div>

    </Link>
  );
};

export default FloatingMascot;