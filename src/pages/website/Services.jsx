import { Link } from 'react-router-dom';
import { Package, Truck, Home, Building2, Car, ShieldCheck, CheckCircle2, Users, Clock, Zap, FileText, MapPin, MessageCircle, Box } from 'lucide-react';
import mascota from '../../assets/images/mascota.png'; 

const Services = () => {
  return (
    <div className="py-12 bg-slate-50"> 
      
      {/* 1. ENCABEZADO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <span className="bg-white/50 px-4 py-1 rounded-full text-cadena-pink font-bold tracking-widest uppercase text-xs border border-white/40 shadow-sm">
          Tipos de Servicio
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mt-4 mb-6">
          Elige tu Modalidad Ideal
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Nos adaptamos a tu presupuesto y urgencia. ¿Prefieres velocidad o economía?
        </p>
      </div>

      {/* 2. LOS PROTAGONISTAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* MUDANZA EXCLUSIVA */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-cadena-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Truck size={32} />
                </div>
                <span className="bg-cadena-blue/10 text-cadena-blue text-xs font-bold px-3 py-1 rounded-full border border-blue-100 uppercase">
                  La más rápida
                </span>
              </div>
              
              <h3 className="text-3xl font-black text-slate-800 mb-2">Mudanza Exclusiva</h3>
              <p className="text-cadena-blue font-medium mb-6 text-sm uppercase tracking-wide">Servicio Directo &bull; Camión Completo</p>
              
              <p className="text-slate-600 mb-8 leading-relaxed font-medium">
                El camión es 100% para ti. Tú eliges la fecha y hora exacta de salida. Vamos directo de puerta a puerta sin escalas ni desvíos.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-700 font-medium"><Zap size={20} className="text-yellow-500"/> Entrega rápida.</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 size={20} className="text-blue-400"/> Tú defines el horario.</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 size={20} className="text-blue-400"/> Espacio exclusivo para ti.</li>
              </ul>
            </div>
          </div>

          {/* MUDANZA COMPARTIDA */}
          <div className="bg-white/40 backdrop-blur-lg rounded-[2.5rem] p-10 border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-white text-cadena-pink rounded-2xl flex items-center justify-center shadow-md">
                  <Users size={32} />
                </div>
                <span className="bg-cadena-pink/10 text-cadena-pink text-xs font-bold px-3 py-1 rounded-full border border-pink-100 uppercase">
                  Ahorra
                </span>
              </div>
              
              <h3 className="text-3xl font-black text-slate-800 mb-2">Mudanza Compartida</h3>
              <p className="text-cadena-pink font-medium mb-6 text-sm uppercase tracking-wide">Servicio Consolidado &bull; Económico</p>
              
              <p className="text-slate-600 mb-8 leading-relaxed font-medium">
                Tu mudanza viaja junto con otras, dividiendo los gastos de transporte. Perfecto si eres flexible con la fecha de entrega.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-700 font-medium"><Clock size={20} className="text-gray-400"/> Entrega de 5 a 15 días hábiles.</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 size={20} className="text-pink-400"/> Precio mucho más accesible.</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 size={20} className="text-pink-400"/> Ideal para cargas medianas.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* 3. SOLUCIONES ESPECIALIZADAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-extrabold text-slate-800">Soluciones Especializadas</h3>
          <p className="text-slate-500 mt-2">Todo lo que necesitas para completar tu traslado.</p>
        </div>
        
        {/* TARJETAS PREMIUM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              icon: <Building2 size={28}/>, 
              title: "Corporativo", 
              desc: "Logística para oficinas sin detener tu operación.",
              color: "bg-blue-500",
              shadow: "shadow-blue-200",
              bg: "bg-blue-50"
            },
            { 
              icon: <Car size={28}/>, 
              title: "Traslado de Autos", 
              desc: "Llevamos tu coche sin rodar (Madrina/Caja).",
              color: "bg-purple-500",
              shadow: "shadow-purple-200",
              bg: "bg-purple-50"
            },
            { 
              icon: <Box size={28}/>, 
              title: "Empaque", 
              desc: "Cajas, playo y burbuja para cuidar lo frágil.",
              color: "bg-orange-500",
              shadow: "shadow-orange-200",
              bg: "bg-orange-50"
            },
            { 
              icon: <ShieldCheck size={28}/>, 
              title: "Seguro de Carga", 
              desc: "Póliza contra todo riesgo (CHUBB, AIG).",
              color: "bg-green-500",
              shadow: "shadow-green-200",
              bg: "bg-green-50"
            }
          ].map((item, i) => (
            <div key={i} className="group bg-white rounded-3xl p-6 border border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${item.bg} to-transparent pointer-events-none`}></div>
              
              <div className="relative z-10 text-center">
                <div className={`w-14 h-14 mx-auto ${item.color} text-white rounded-2xl flex items-center justify-center shadow-lg ${item.shadow} mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-black">{item.title}</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed group-hover:text-slate-700">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SECCIÓN FINAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-pink-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* IZQUIERDA: BENEFICIOS */}
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-8">
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
                  href={`${import.meta.env.BASE_URL}catalogo.pdf`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cadena-dark hover:bg-gray-800 transition"
                >
                  Descargar Catálogo Completo (PDF)
                </a>
              </div>
            </div>

            {/* DERECHA: MASCOTA TIPO PERFIL Y CTA */}
            <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 text-center border border-white/60 shadow-inner">
               
               {/* AQUÍ ESTÁ LA MAGIA DE LA FOTO DE PERFIL:
                 1. div contenedor: crea el círculo (rounded-full) y corta lo que sobre (overflow-hidden).
                 2. border-4 border-white: le da el marco blanco típico de foto de perfil.
                 3. img: tiene 'scale-125' para hacer zoom y 'object-top' para enfocar la cara/cuerpo superior.
               */}
               <div className="w-32 h-32 md:w-56 md:h-56 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-2xl relative bg-blue-50 group cursor-pointer">
                 <img 
                   src={mascota} 
                   alt="Mascota" 
                   className="w-full h-full object-cover object-top scale-125 group-hover:scale-100 transition-transform duration-500" 
                 />
               </div>

               <h3 className="text-2xl font-bold text-slate-800 mb-2">¿Listo para mudarte?</h3>
               <p className="text-slate-600 mb-6 text-sm font-medium">
                 Déjanos los detalles pesados a nosotros. Cotiza tu servicio hoy mismo.
               </p>
               
               <div className="flex flex-col gap-3">
                 <a 
                   href="https://wa.me/529994154957" 
                   target="_blank"
                   rel="noreferrer"
                   className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition shadow-lg hover:shadow-green-400/50"
                 >
                   <MessageCircle size={20} />
                   Pedir Cotización por WhatsApp
                 </a>

                 <Link 
                   to="/cotizar" 
                   className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-cadena-blue hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg hover:shadow-blue-400/50"
                 >
                   <FileText size={20} />
                   Cotizar en Línea (Formulario)
                 </Link>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;