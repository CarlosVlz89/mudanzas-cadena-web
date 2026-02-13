import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Shield, Lock } from 'lucide-react';
// IMPORTAMOS EL NUEVO COMPONENTE (Asegúrate que la ruta sea correcta)
import PrivacyModal from './PrivacyModal'; 

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <footer id="contacto" className="bg-cadena-dark text-white pt-12 pb-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- SECCIÓN SUPERIOR (COLUMNAS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Columna 1: Identidad */}
          <div>
            <h3 className="text-2xl font-bold mb-4">MUDANZAS <span className="text-cadena-pink">CADENA</span></h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Más de 60 años cuidando tu patrimonio. Hacemos de tu mudanza algo fácil y sencillo, con disciplina y puntualidad.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/17eb7PMnCq/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-cadena-blue transition">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/mudanzas.cadena" target="_blank" rel="noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-cadena-pink transition">
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

          {/* Columna 3: Horarios y PDF */}
          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-cadena-blue inline-block pb-1">Horario de Atención</h4>
            <ul className="space-y-2 text-gray-300 text-sm mb-6">
              <li className="flex justify-between">
                <span>Lunes - Domingo:</span>
                <span className="text-white font-medium">8:00 hrs - 22:00 hrs</span>
              </li>
            </ul>
            
            <a 
              href={`${import.meta.env.BASE_URL}catalogo.pdf`} 
              target="_blank"
              rel="noopener noreferrer"
              download
              className="block w-full text-center border border-gray-600 text-gray-300 py-2 rounded hover:border-white hover:text-white transition text-sm"
            >
              Descargar Catálogo PDF
            </a>
          </div>
        </div>

        {/* --- BARRA INFERIOR (REORGANIZADA) --- */}
        {/* En móvil se apila: Admin arriba, Aviso en medio, Copyright al final */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500">
          
          {/* 1. IZQUIERDA: Acceso Admin (Lejos del botón de WhatsApp) */}
          <div className="w-full md:w-auto flex justify-center md:justify-start order-2 md:order-1">
             <Link to="/admin" className="flex items-center gap-2 hover:text-white transition opacity-50 hover:opacity-100 py-2 px-4 border border-gray-800 rounded-lg md:border-none">
                <Lock size={12}/> Acceso Administrativo
             </Link>
          </div>

          {/* 2. CENTRO: Aviso de Privacidad (El lugar más seguro para el clic) */}
          <div className="order-1 md:order-2">
             <button 
                onClick={() => setShowPrivacy(true)} 
                className="flex items-center gap-2 text-gray-300 hover:text-cadena-blue transition bg-gray-900/50 px-4 py-2 rounded-full border border-gray-700 hover:border-cadena-blue"
             >
                <Shield size={14}/> 
                <span className="font-medium">Leer Aviso de Privacidad</span>
             </button>
          </div>

          {/* 3. DERECHA: Copyright */}
          <div className="text-center md:text-right order-3">
            <p>&copy; {new Date().getFullYear()} Mudanzas Cadena.</p>
            <p className="opacity-50 mt-1">Todos los derechos reservados.</p>
          </div>

        </div>
      </div>

      {/* --- RENDERIZAMOS EL MODAL IMPORTADO --- */}
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

    </footer>
  );
};

export default Footer;