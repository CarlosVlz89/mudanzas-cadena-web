import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Truck } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Función inteligente con cálculo de compensación (Offset)
  const handleNavigation = (sectionId) => {
    setIsMenuOpen(false);

    const scrollToElement = (id) => {
      // 1. Si es "inicio", forzamos ir hasta arriba del todo (0)
      if (id === 'inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 2. Para otras secciones, calculamos la posición y restamos la altura del menú
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100; // 80px del menú + 20px de aire
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    // Lógica de rutas (Si no estoy en Home, voy a Home y luego scrolleo)
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToElement(sectionId), 100);
    } else {
      scrollToElement(sectionId);
    }
  };

  // Estilos base para los botones del menú
  const navLinkClass = "bg-transparent border-none cursor-pointer text-gray-600 hover:text-cadena-pink font-medium transition text-base";

  return (
    <nav className="bg-white/70 backdrop-blur-lg border-b border-white/40 shadow-sm fixed w-full z-50 top-0 left-0 h-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          {/* LOGO */}
          <button 
            onClick={() => handleNavigation('inicio')} 
            className="flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none group"
          >
            {/* Icono del Camión (Rosa) */}
            <Truck size={36} className="text-cadena-pink transform group-hover:-translate-x-1 transition-transform duration-300" />
            
            {/* Texto con dos colores */}
            <span className="font-black text-2xl tracking-tighter flex items-center gap-1">
              <span className="text-gray-900">MUDANZAS</span> {/* Negro */}
              <span className="text-cadena-pink">CADENA</span> {/* Rosa */}
            </span>
          </button>

          {/* MENÚ DE ESCRITORIO */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleNavigation('inicio')} className={navLinkClass}>
              Inicio
            </button>
            <button onClick={() => handleNavigation('servicios')} className={navLinkClass}>
              Servicios
            </button>
            <button onClick={() => handleNavigation('contacto')} className={navLinkClass}>
              Contacto
            </button>
            
            {/* ENLACE DE RASTREO (Nuevo) */}
            <Link to="/rastreo" className={navLinkClass}>
              Rastreo
            </Link>
            
            {/* Botón Cotizar */}
            <Link 
              to="/cotizar" 
              className="bg-cadena-blue text-white px-6 py-2.5 rounded-full font-bold hover:bg-ocean-dark transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Cotizar Ahora
            </Link>
          </div>

          {/* HAMBURGUESA MÓVIL */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-cadena-pink bg-transparent border-none">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-xl border-t border-white/40 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <button onClick={() => handleNavigation('inicio')} className="block w-full text-left px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium bg-transparent">
              Inicio
            </button>
            <button onClick={() => handleNavigation('servicios')} className="block w-full text-left px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium bg-transparent">
              Servicios
            </button>
            <button onClick={() => handleNavigation('contacto')} className="block w-full text-left px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium bg-transparent">
              Contacto
            </button>
            
            {/* ENLACE DE RASTREO MÓVIL (Nuevo) */}
            <Link 
              to="/rastreo" 
              onClick={() => setIsMenuOpen(false)} 
              className="block w-full text-left px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium bg-transparent"
            >
              Rastrea tu Mudanza
            </Link>

            <Link to="/cotizar" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-cadena-blue text-white px-5 py-3 rounded-lg font-bold mt-4 shadow-md">
              Cotizar Ahora
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;