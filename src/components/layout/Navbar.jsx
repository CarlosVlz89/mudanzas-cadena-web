import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, Truck } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* LOGOTIPO */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              {/* Aquí luego pondremos la imagen real del logo */}
              <div className="w-10 h-10 bg-cadena-blue rounded-lg flex items-center justify-center text-white">
                <Truck size={24} />
              </div>
              <span className="font-bold text-xl text-cadena-dark tracking-wide">
                MUDANZAS <span className="text-cadena-pink">CADENA</span>
              </span>
            </Link>
          </div>

          {/* MENÚ DE ESCRITORIO */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-cadena-blue font-medium transition">Inicio</Link>
            <Link to="/servicios" className="text-gray-600 hover:text-cadena-blue font-medium transition">Servicios</Link>
            <Link to="/rastreo" className="text-gray-600 hover:text-cadena-blue font-medium transition">Rastreo</Link>
            
            {/* Botón de Llamada a la Acción */}
            <a 
              href="/cotizar" 
              target="_blank"
              className="bg-cadena-blue text-white px-5 py-2.5 rounded-full font-bold hover:bg-ocean-dark transition flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Phone size={18} />
              Cotizar Ahora
            </a>
          </div>

          {/* BOTÓN MENÚ MÓVIL (Hamburguesa) */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-cadena-blue">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-cadena-dark font-medium hover:bg-gray-50">Inicio</Link>
            <Link to="/servicios" className="block px-3 py-2 text-cadena-dark font-medium hover:bg-gray-50">Servicios</Link>
            <Link to="/rastreo" className="block px-3 py-2 text-cadena-dark font-medium hover:bg-gray-50">Rastreo</Link>
            <Link to="/cotizar" className="bg-cadena-blue text-white px-5 py-2.5 rounded-full font-bold hover:bg-ocean-dark transition flex items-center gap-2 shadow-lg"
            >
              <Phone size={18} />
              Cotizar Ahora
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;