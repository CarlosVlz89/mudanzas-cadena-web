import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-cadena-dark text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Columna 1: Identidad */}
          <div>
            <h3 className="text-2xl font-bold mb-4">MUDANZAS <span className="text-cadena-pink">CADENA</span></h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Más de 60 años cuidando tu patrimonio. Hacemos de tu mudanza algo fácil y sencillo, con disciplina y puntualidad.
            </p>
            <div className="flex space-x-4">
              {/* Iconos sociales */}
              <a href="https://www.facebook.com/share/17eb7PMnCq/?mibextid=wwXIfr" target="_blank" className="p-2 bg-gray-800 rounded-full hover:bg-cadena-blue transition">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/mudanzas.cadena" target="_blank" className="p-2 bg-gray-800 rounded-full hover:bg-cadena-pink transition">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Columna 2: Contacto Rápido */}
          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-cadena-blue inline-block pb-1">Contacto</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-cadena-pink mt-1" size={18} />
                <span>Valle del Eufrates 37, CTM 14,<br/>55235 Ecatepec de Morelos, Méx.</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-cadena-blue" size={18} />
                <a href="tel:+529994154957" className="hover:text-white transition">+52 999 415 4957</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-cadena-blue" size={18} />
                <a href="mailto:mudanzascadenamx@gmail.com" className="hover:text-white transition">mudanzascadenamx@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Horarios y Enlaces */}
          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-cadena-blue inline-block pb-1">Horario de Atención</h4>
            <ul className="space-y-2 text-gray-300 text-sm mb-6">
              <li className="flex justify-between">
                <span>Lunes - Domingo:</span>
                <span className="text-white font-medium">8:00 - 22:00 hrs</span>
              </li>
            </ul>
            <a 
              href="/docs/Catálogo de Servicios Mudanzas Cadena.pdf" 
              target="_blank"
              className="block w-full text-center border border-gray-600 text-gray-300 py-2 rounded hover:border-white hover:text-white transition text-sm"
            >
              Descargar Catálogo PDF
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Mudanzas Cadena. Todos los derechos reservados.</p>
        </div>
        <div className="flex justify-center gap-4 text-xs opacity-50 hover:opacity-100 transition-opacity">
          <Link to="/admin" className="hover:text-white">Acceso Administrativo</Link>
          <span>|</span>
          <Link to="/trabajadores" className="hover:text-white">Acceso Operadores</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;