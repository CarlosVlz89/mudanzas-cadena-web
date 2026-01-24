import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Heart } from 'lucide-react';
import heroImage from '../../assets/images/hero-truck.jpg'; 
import Services from './Services'; 

const Home = () => {
  return (
    // Agregamos un fondo base gris muy claro y 'relative' para contener las manchas
    <div className="flex flex-col w-full bg-slate-50 relative overflow-hidden pt-20">
      
      {/* --- EFECTO LIQUID (Manchas de fondo) --- */}
      {/* Mancha Rosa Arriba Derecha */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cadena-pink/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
      {/* Mancha Azul Abajo Izquierda */}
      <div className="absolute top-[800px] left-0 w-[600px] h-[600px] bg-cadena-blue/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none z-0"></div>
       {/* Mancha Azul en Servicios */}
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-blue-200/30 rounded-full blur-3xl translate-y-1/4 pointer-events-none z-0"></div>
      
      {/* --- CONTENIDO (z-10 para que quede encima de las manchas) --- */}
      <div className="relative z-10">

        {/* HERO (Igual que antes) */}
        <div id="inicio" className="relative h-[600px] flex items-center scroll-mt-24">
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroImage})` }}>
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-cadena-pink/90 backdrop-blur-sm text-white text-sm font-bold mb-4 tracking-wider border border-white/20 shadow-lg">
              MUDANZAS Y FLETES NACIONALES
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
              Tu patrimonio en las <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-pink-200">mejores manos</span>
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl drop-shadow-md">
              Hacemos de tu mudanza algo fácil y sencillo. Más de 60 años cuidando lo que más te importa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://wa.me/529994154957" className="px-8 py-4 bg-cadena-blue hover:bg-ocean-dark text-white font-bold rounded-xl transition shadow-lg hover:shadow-blue-500/50">
                Cotizar Ahora
              </a>
              {/* Botón Cristal */}
              <Link to="/rastreo" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg">
                Rastrear mi Mudanza <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* SECCIÓN VALORES (Estilo Tarjetas Cristal) */}
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

        {/* SECCIÓN SERVICIOS (Aquí entra el otro componente) */}
        <section id="servicios" className="scroll-mt-24">
          <Services />
        </section>

        {/* SECCIÓN FILOSOFÍA (Glass Dark) */}
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