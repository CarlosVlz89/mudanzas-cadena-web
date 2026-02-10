import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, Heart, MessageCircle, FileText, MapPin } from 'lucide-react';
import heroVideo from '../../assets/videos/hero-truck.mp4';
import posterImage from '../../assets/images/truck-side.jpg'; 
import Services from './Services';
import Gallery from '../../components/website/Gallery'; 

const Home = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Intentamos forzar la reproducción apenas cargue el componente
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("El navegador bloqueó el autoplay (normal en móviles/ahorro de batería):", error);
        // Si entra aquí, isVideoPlaying se queda en false, así que se verá la imagen.
      });
    }
  }, []);

  return (
    <div className="flex flex-col w-full bg-slate-50 relative overflow-hidden pt-20">
      
      {/* Manchas de fondo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cadena-pink/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
      <div className="absolute top-[800px] left-0 w-[600px] h-[600px] bg-cadena-blue/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-blue-200/30 rounded-full blur-3xl translate-y-1/4 pointer-events-none z-0"></div>
      
      <div className="relative z-10">

        {/* HERO */}
        <div id="inicio" className="relative h-[600px] flex items-center scroll-mt-24 overflow-hidden bg-gray-900">
  
          {/* A. IMAGEN DE FONDO (SIEMPRE VISIBLE DETRÁS) */}
          <img 
            src={posterImage} 
            alt="Fondo Mudanzas Cadena" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-80" 
          />

          {/* B. VIDEO (SÓLO SE MUESTRA SI REALMENTE ESTÁ CORRIENDO) */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            // CAMBIO CLAVE: Usamos 'onPlay' en lugar de 'onCanPlayThrough'
            // Esto asegura que solo se muestre cuando los cuadros ya se están moviendo
            onPlay={() => setIsVideoPlaying(true)}
            className={`absolute inset-0 z-10 w-full h-full object-cover transition-opacity duration-700 ${
              isVideoPlaying ? 'opacity-100' : 'opacity-0'
            }`} 
          >
            <source src={heroVideo} type="video/mp4" />
          </video>

          {/* C. OVERLAY OSCURO */}
          <div className="absolute inset-0 bg-black/60 z-20"></div>

          {/* Contenido Hero */}
          <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-cadena-pink/90 backdrop-blur-sm text-white text-sm font-bold mb-4 tracking-wider border border-white/20 shadow-lg animate-fade-in">
              MUDANZAS Y FLETES NACIONALES
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
              Tu patrimonio en las <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-pink-200">mejores manos</span>
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl drop-shadow-md">
              Hacemos de tu mudanza algo fácil y sencillo. Más de 60 años cuidando lo que más te importa.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center sm:justify-start">
              <Link to="/cotizar" className="px-6 py-4 bg-cadena-pink hover:bg-pink-600 text-white font-bold rounded-xl transition shadow-lg hover:shadow-pink-500/50 flex items-center justify-center gap-2">
                <FileText size={20} /> Cotizar en Línea
              </Link>
              <a href="https://wa.me/529994154957" target="_blank" rel="noreferrer" className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2">
                <MessageCircle size={20} /> WhatsApp
              </a>
              <Link to="/rastreo" className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg">
                <MapPin size={20} /> Rastrear
              </Link>
            </div>
          </div>
        </div>

        {/* VALORES */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: <Shield size={32}/>, title: "Seguridad Total", text: "Rastreo 24/7 y seguro con CHUBB.", color: "text-cadena-blue" },
                { icon: <Clock size={32}/>, title: "Puntualidad", text: "Llegamos cuando decimos. Disciplina pura.", color: "text-cadena-pink" },
                { icon: <Heart size={32}/>, title: "Trato Humano", text: "Empresa familiar. Entendemos el valor sentimental.", color: "text-purple-500" }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl hover:-translate-y-2 transition duration-300">
                  <div className={`w-16 h-16 ${item.color} bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="servicios" className="scroll-mt-24"><Services /></section>
        <section id="galeria"><Gallery /></section>

        {/* FILOSOFÍA */}
        <div className="py-24">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-[3rem] p-12 shadow-2xl">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <div>
                   <h2 className="text-3xl font-bold text-cadena-dark mb-6">Nuestra Filosofía</h2>
                   <div className="mb-8">
                     <h3 className="text-xl font-bold text-cadena-blue mb-2">Misión</h3>
                     <p className="text-gray-700">Hacer de tu mudanza algo fácil, cuidando tu patrimonio de principio a fin.</p>
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-cadena-pink mb-2">Visión</h3>
                     <p className="text-gray-700">Llegar a cada rincón de la República Mexicana con la misma eficiencia.</p>
                   </div>
                 </div>
                 <div className="h-64 bg-gradient-to-br from-cadena-blue to-purple-900 rounded-3xl shadow-inner flex items-center justify-center text-white p-8 text-center border border-white/20">
                   <div>
                     <span className="text-6xl font-black block mb-2 drop-shadow-lg">+60</span>
                     <span className="text-xl font-medium tracking-widest uppercase">Años de experiencia</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Home;