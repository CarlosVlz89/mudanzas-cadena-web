import { Package, Truck, Home, Building2, Car, ShieldCheck, CheckCircle2 } from 'lucide-react';
import truckSide from '../../assets/images/truck-side.jpg';
import mascota from '../../assets/images/mascota.png'; // Asegúrate de tener la mascota aquí

const Services = () => {
  
  // Lista de servicios basada en tu formulario
  const servicesList = [
    {
      icon: <Home size={40} />,
      title: "Mudanza Residencial",
      description: "Tratamos tus muebles como si fueran nuestros. Embalaje especializado para proteger tu patrimonio familiar."
    },
    {
      icon: <Building2 size={40} />,
      title: "Mudanza Corporativa",
      description: "Logística eficiente para oficinas y empresas. Minimizamos el tiempo de inactividad de tu negocio."
    },
    {
      icon: <Truck size={40} />,
      title: "Carga General y Fletes",
      description: "Transporte de mercancías a nivel nacional con unidades de 3.5 toneladas, Tortón (90m³) y Tráiler (53 pies)."
    },
    {
      icon: <Car size={40} />,
      title: "Traslado de Vehículos",
      description: "Llevamos tu auto sin rodar a cualquier parte de la república. Servicio seguro y garantizado."
    },
    {
      icon: <Package size={40} />,
      title: "Empaque y Embalaje",
      description: "Servicio profesional de emplayado, cajas y protección especial para objetos delicados."
    },
    {
      icon: <ShieldCheck size={40} />,
      title: "Seguro de Carga",
      description: "Tu tranquilidad es primero. Cobertura amplia contra siniestros con aseguradoras líderes (CHUBB, AIG, ZURICH)."
    }
  ];

  return (
    <div className="bg-white">
      
      {/* 1. ENCABEZADO CON IMAGEN LATERAL */}
      <div className="relative bg-cadena-dark text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={truckSide} 
            alt="Flota de Mudanzas Cadena" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestros Servicios</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Soluciones logísticas integrales. Desde una caja hasta una casa completa, llegamos a cualquier rincón de México.
          </p>
        </div>
      </div>

      {/* 2. GRILLA DE SERVICIOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service, index) => (
            <div 
              key={index} 
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100 group"
            >
              <div className="text-cadena-blue mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-cadena-dark mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SECCIÓN DE CONFIANZA Y EXTRAS */}
      <div className="bg-ocean-light/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Lista de beneficios */}
            <div>
              <h2 className="text-3xl font-bold text-cadena-dark mb-6">
                ¿Por qué elegir <span className="text-cadena-blue">Mudanzas Cadena</span>?
              </h2>
              <ul className="space-y-4">
                {[
                  "Unidades con rampa hidráulica y GPS 24/7.",
                  "Volado de muebles y maniobras especiales.",
                  "Personal capacitado y de confianza.",
                  "Facturación electrónica disponible.",
                  "Cobertura en rutas del Pacífico y Sureste (Mérida, Cancún)."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-cadena-pink flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                 <a 
                  href="/docs/Catálogo de Servicios Mudanzas Cadena.pdf" 
                  target="_blank"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cadena-dark hover:bg-gray-800 transition"
                >
                  Descargar Catálogo Completo (PDF)
                </a>
              </div>
            </div>

            {/* LA MASCOTA Y EL CTA */}
            <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-cadena-blue/20 text-center">
              {/* Círculo decorativo detrás de la mascota */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-cadena-blue rounded-full flex items-center justify-center border-4 border-white shadow-md">
                 {/* Si tienes la imagen de la mascota, úsala aquí. Si no, deja el icono */}
                 <img src={mascota} alt="Mascota" className="w-20 h-20 object-contain" />
              </div>
              
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-cadena-dark mb-2">¿Listo para mudarte?</h3>
                <p className="text-gray-600 mb-6">
                  Déjanos los detalles pesados a nosotros. Cotiza tu servicio hoy mismo.
                </p>
                <a 
                  href="https://wa.me/529994154957"
                  className="block w-full py-3 px-4 bg-cadena-pink hover:bg-pink-600 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl"
                >
                  Pedir Cotización por WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Services;