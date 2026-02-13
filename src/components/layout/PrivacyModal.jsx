import { X } from 'lucide-react';
import { createPortal } from 'react-dom'; // 1. IMPORTANTE: Importamos esto

const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // 2. Usamos createPortal para "sacar" el modal del Footer y ponerlo en el body
  return createPortal(
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      
      {/* Contenedor del Modal */}
      <div className="bg-white text-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-fade-in-up relative">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl shrink-0">
          <div>
            <h3 className="text-xl font-bold text-cadena-dark">Aviso de Privacidad Integral</h3>
            <p className="text-xs text-gray-500">Última actualización: Febrero 2026</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="p-8 overflow-y-auto text-sm leading-relaxed space-y-6">
          <p>
            <strong>Mudanzas Cadena</strong> (en adelante, "El Responsable"), con domicilio en <strong>Valle del Eufrates 37, CTM 14, Ecatepec de Morelos, México</strong>, es responsable de recabar sus datos personales, del uso que se le dé a los mismos y de su protección, de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
          </p>

          <div>
            <h4 className="font-bold text-cadena-blue mb-2">1. DATOS PERSONALES Y PATRIMONIALES RECABADOS</h4>
            <p className="mb-2">Para la prestación de servicios de logística, mudanza y transporte, recabamos:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li><strong>Datos de Identificación:</strong> Nombre completo e identificación oficial.</li>
              <li><strong>Datos de Contacto:</strong> Número de teléfono (WhatsApp), correo electrónico.</li>
              <li><strong>Datos de Ubicación:</strong> Dirección completa de origen y destino.</li>
              <li><strong>Datos Patrimoniales:</strong> Inventario de bienes, valor estimativo de carga y detalles de acceso.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-cadena-blue mb-2">2. FINALIDADES DEL TRATAMIENTO</h4>
            <p>Sus datos serán utilizados para las siguientes finalidades necesarias:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 mt-2">
              <li>Generación de presupuestos y cotizaciones precisas.</li>
              <li>Planificación logística y asignación de rutas.</li>
              <li>Uso del <strong>Sistema de Gestión y Rastreo</strong> para que visualice su mudanza.</li>
              <li>Validación de identidad por seguridad en la entrega.</li>
              <li>Gestión de seguros de transporte (en caso de contratarse).</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-cadena-blue mb-2">3. SEGURIDAD Y TECNOLOGÍAS</h4>
            <p>"El Responsable" utiliza una plataforma basada en <strong>Google Firebase</strong>, garantizando que su inventario y estatus están protegidos con seguridad de nivel empresarial. Utilizamos almacenamiento local seguro para mantener su sesión activa en el panel de clientes.</p>
          </div>

          <div>
            <h4 className="font-bold text-cadena-blue mb-2">4. TRANSFERENCIA DE DATOS</h4>
            <p>Sus datos no se comparten con terceros, salvo con aseguradoras (si aplica) o autoridades competentes si es requerido estrictamente por ley durante el tránsito.</p>
          </div>

          <div>
            <h4 className="font-bold text-cadena-blue mb-2">5. DERECHOS ARCO</h4>
            <p>Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos. Para ejercer estos derechos, contacte al área administrativa a través de: <a href="mailto:mudanzascadenamx@gmail.com" className="text-blue-600 underline">mudanzascadenamx@gmail.com</a>.</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-bold text-cadena-blue mb-1">6. ACEPTACIÓN DIGITAL</h4>
            <p className="text-xs text-blue-800">
              Al solicitar una cotización o ingresar al panel de gestión, usted reconoce que ha leído y acepta los términos del presente Aviso de Privacidad. El uso del sistema implica su consentimiento explícito.
            </p>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-2xl shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-cadena-dark text-white rounded-lg hover:bg-black transition font-bold text-sm"
          >
            Entendido, cerrar
          </button>
        </div>

      </div>
    </div>,
    document.body // 3. AQUÍ LE DECIMOS: "Píntate en el body, fuera del Footer"
  );
};

export default PrivacyModal;