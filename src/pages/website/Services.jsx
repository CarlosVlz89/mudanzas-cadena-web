import { Package, Truck, Home, Building2, Car, ShieldCheck, CheckCircle2, Users, Clock, Zap, FileText, MapPin } from 'lucide-react';
import mascota from '../../assets/images/mascota.png'; 

const Services = () => {
  return (
    <div className="py-12"> 
      
      {/* 1. ENCABEZADO (Estilo Limpio) */}
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

      {/* 2. LOS PROTAGONISTAS (DISEÑO GLASS + TEXTOS ANTERIORES) */}
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
                <li className="flex items-center gap-3 text-slate-700 font-medium"><Zap size={20} className="text-yellow-500"/> Entrega rápida (24-48 hrs).</li>
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
                  Ahorra hasta 40%
                </span>
              </div>
              
              <h3 className="text-3xl font-black text-slate-800 mb-2">Mudanza Compartida</h3>
              <p className="text-cadena-pink font-medium mb-6 text-sm uppercase tracking-wide">Servicio Consolidado &bull; Económico</p>
              
              <p className="text-slate-600 mb-8 leading-relaxed font-medium">
                Tu mudanza viaja junto con otras, dividiendo los gastos de transporte. Perfecto si eres flexible con la fecha de entrega.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-700 font-medium"><Clock size={20} className="text-gray-400"/> Entrega de 5 a 12 días hábiles.</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 size={20} className="text-pink-400"/> Precio mucho más accesible.</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 size={20} className="text-pink-400"/> Ideal para cargas medianas.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* 3. COMPLEMENTARIOS (Glass Mini Cards + Textos Anteriores) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-slate-800">Soluciones Especializadas</h3>
          <p className="text-slate-500">Todo lo que necesitas para completar tu traslado.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Building2/>, title: "Corporativo", desc: "Logística para oficinas sin detener tu operación." },
            { icon: <Car/>, title: "Traslado de Autos", desc: "Llevamos tu coche sin rodar (Madrina/Caja)." },
            { icon: <Package/>, title: "Empaque", desc: "Cajas, playo y burbuja para cuidar lo frágil." },
            { icon: <ShieldCheck/>, title: "Seguro de Carga", desc: "Póliza contra todo riesgo (CHUBB, AIG)." }
          ].map((item, i) => (
            <div key={i} className="bg-white/30 backdrop-blur-md p-6 rounded-2xl border border-white/40 hover:bg-white/50 transition duration-300">
              <div className="text-slate-400 mb-3">{item.icon}</div>
              <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SECCIÓN FINAL (DISEÑO GLASS + ESTRUCTURA IZQ/DER ANTERIOR) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Brillo decorativo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-pink-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* IZQUIERDA: BENEFICIOS (Textos Exactos Anteriores) */}
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-8">
                ¿Por qué elegir <span className="text-cadena-blue">Mudanzas Cadena</span>?
              </h2>
              <ul className="space-y-6">
                {[
                  { icon: <Truck size={20}/>, title: "Infraestructura Propia", text: "Unidades con rampa hidráulica y GPS 24/7.", color: "bg-blue-100 text-blue-600" },
                  { icon: <Package size={20}/>, title: "Maniobras Especiales", text: "Volado de muebles y maniobras especiales.", color: "bg-pink-100 text-pink-600" },
                  { icon: <Users size={20}/>, title: "Personal de Confianza", text: "Personal capacitado y de confianza.", color: "bg-green-100 text-green-600" },
                  { icon: <FileText size={20}/>, title: "Formalidad", text: "Facturación electrónica disponible.", color: "bg-purple-100 text-purple-600" },
                  { icon: <MapPin size={20}/>, title: "Rutas Frecuentes", text: "Cobertura en rutas del Pacífico y Sureste (Mérida, Cancún).", color: "bg-yellow-100 text-yellow-600" }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl ${item.color} shadow-sm mt-1`}>{item.icon}</div>
                    <div>
                       <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                       <p className="text-slate-600 text-sm">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                 <a href="/docs/Catálogo.pdf" target="_blank" className="text-cadena-blue font-bold text-sm hover:underline border border-cadena-blue px-6 py-2 rounded-full hover:bg-cadena-blue hover:text-white transition">
                   Descargar Catálogo Completo (PDF)
                 </a>
              </div>
            </div>

            {/* DERECHA: MASCOTA Y CTA (Estilo Glass) */}
            <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 text-center border border-white/60 shadow-inner">
               <img src={mascota} alt="Mascota" className="w-28 h-28 object-contain mx-auto mb-6 drop-shadow-xl hover:scale-110 transition duration-300" />
               <h3 className="text-2xl font-bold text-slate-800 mb-2">¿Listo para mudarte?</h3>
               <p className="text-slate-600 mb-6 text-sm font-medium">
                 Déjanos los detalles pesados a nosotros. Cotiza tu servicio hoy mismo.
               </p>
               <a href="https://wa.me/529994154957" className="block w-full py-4 bg-cadena-pink hover:bg-pink-600 text-white font-bold rounded-xl transition shadow-lg hover:shadow-pink-400/50">
                 Pedir Cotización por WhatsApp
               </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;