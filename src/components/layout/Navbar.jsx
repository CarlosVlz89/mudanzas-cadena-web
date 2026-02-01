import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Image, Phone, MapPin, Package, Truck } from 'lucide-react'; // Deje Truck por si lo usas en el menú móvil
import logo from '../../assets/images/logo.png'; 

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (sectionId) => {
    setIsMenuOpen(false);
    const scrollToElement = (id) => {
      if (id === 'inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100; 
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToElement(sectionId), 100);
    } else {
      scrollToElement(sectionId);
    }
  };

  const navLinkClass = "bg-transparent border-none cursor-pointer text-gray-600 hover:text-cadena-pink font-bold text-xs lg:text-sm uppercase tracking-wide transition whitespace-nowrap";
  const mobileLinkClass = "flex flex-col items-center justify-center gap-1 w-full py-4 text-lg font-bold text-slate-700 bg-white/40 backdrop-blur-md hover:bg-white/80 hover:text-cadena-pink hover:scale-[1.02] rounded-2xl transition-all duration-300 border border-white/50 shadow-sm";

  return (
    <>
      {/* BARRA DE NAVEGACIÓN (Desktop) */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-white/40 shadow-sm fixed w-full z-50 top-0 left-0 h-20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full gap-2">
            
            {/* --- LOGO DE MUDANZAS CADENA --- */}
            <button 
              onClick={() => handleNavigation('inicio')} 
              className="flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none group shrink-0 mr-auto"
            >
              {/* Aquí mostramos la imagen. 
                  'h-10 md:h-14' controla la altura para que no se vea ni muy chico ni muy grande. 
                  'w-auto' mantiene la proporción. */}
              <img 
                src={logo} 
                alt="Mudanzas Cadena Logo" 
                className="h-14 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105 mt-6" 
              />
            </button>

            {/* MENÚ DE ESCRITORIO */}
            <div className="hidden md:flex items-center gap-3 lg:gap-6">
              <button onClick={() => handleNavigation('inicio')} className={navLinkClass}>Inicio</button>
              <button onClick={() => handleNavigation('servicios')} className={navLinkClass}>Servicios</button>
              <button onClick={() => handleNavigation('galeria')} className={navLinkClass}>Galería</button>
              <button onClick={() => handleNavigation('contacto')} className={navLinkClass}>Contacto</button>
              <Link to="/rastreo" className={navLinkClass}>Rastreo</Link>
              <Link 
                to="/cotizar" 
                className="bg-cadena-blue text-white px-4 py-2 lg:px-6 lg:py-2.5 rounded-full font-bold hover:bg-ocean-dark transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap text-xs lg:text-sm shrink-0"
              >
                Cotizar Ahora
              </Link>
            </div>

            {/* BOTÓN HAMBURGUESA */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="p-2 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 text-slate-700 shadow-sm transition hover:bg-white hover:text-cadena-pink"
              >
                <Menu size={32} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MENÚ MÓVIL --- */}
      <div className={`md:hidden fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl flex flex-col transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Cabecera Móvil */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
           {/* También puse el logo aquí en pequeño para mantener la identidad */}
           <img src={logo} alt="Mudanzas Cadena" className="h-12 w-auto object-contain" />
           
           <button 
             onClick={() => setIsMenuOpen(false)} 
             className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition shadow-sm"
           >
             <X size={28} />
           </button>
        </div>

        {/* Contenido Centrado */}
        <div className="flex-1 flex flex-col items-center justify-start pt-6 px-6 overflow-y-auto space-y-3">
            
            <Link 
              to="/cotizar" 
              onClick={() => setIsMenuOpen(false)} 
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-cadena-pink to-pink-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-pink-200/50 hover:scale-[1.02] transition transform active:scale-95 mb-4"
            >
              <Package size={24} />
              COTIZAR AHORA
            </Link>

            <button onClick={() => handleNavigation('inicio')} className={mobileLinkClass}>
              <Home size={24} className="opacity-60 mb-1"/> Inicio
            </button>
            
            <button onClick={() => handleNavigation('servicios')} className={mobileLinkClass}>
              <Truck size={24} className="opacity-60 mb-1"/> Servicios
            </button>
            
            <button onClick={() => handleNavigation('galeria')} className={mobileLinkClass}>
              <Image size={24} className="opacity-60 mb-1"/> Galería
            </button>
            
            <button onClick={() => handleNavigation('contacto')} className={mobileLinkClass}>
              <Phone size={24} className="opacity-60 mb-1"/> Contacto
            </button>
            
            <Link to="/rastreo" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass}>
              <MapPin size={24} className="opacity-60 mb-1"/> Rastreo
            </Link>

        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </div>
    </>
  );
};

export default Navbar;