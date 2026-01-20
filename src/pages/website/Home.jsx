import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Heart } from 'lucide-react';

// Importamos la imagen (asegúrate de haberla renombrado como te dije en el paso 2)
import heroImage from '../../assets/images/hero-truck.jpg'; 

const Home = () => {
  return (
    <div className="flex flex-col">
      
      {/* 1. SECCIÓN HERO (Portada con imagen de fondo) */}
      <div className="relative h-[600px] flex items-center">
        {/* Imagen de fondo con oscurecimiento (overlay) para que se lean las letras */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div> {/* Capa oscura */}
        </div>

        {/* Contenido del Texto */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="inline-block py-1 px-3 rounded-full bg-cadena-pink text-white text-sm font-bold mb-4 tracking-wider">
            MUDANZAS Y FLETES NACIONALES
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            Tu patrimonio en las <br/>
            <span className="text-cadena-blue">mejores manos</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl">
            Hacemos de tu mudanza algo fácil y sencillo. Más de 60 años cuidando lo que más te importa en cada rincón de la República Mexicana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="https://wa.me/529994154957" 
              className="px-8 py-4 bg-cadena-blue hover:bg-ocean-dark text-white font-bold rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Cotizar Ahora
            </a>
            <Link 
              to="/rastreo" 
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              Rastrear mi Mudanza <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DE VALORES (Iconos) */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Valor 1 */}
            <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-cadena-blue/10 text-cadena-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Seguridad Total</h3>
              <p className="text-gray-600">
                Unidades con rampa hidráulica, rastreo 24/7 y seguro de carga con CHUBB, AIG y ZURICH.
              </p>
            </div>
            {/* Valor 2 */}
            <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-cadena-pink/10 text-cadena-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Puntualidad</h3>
              <p className="text-gray-600">
                Respetamos tu tiempo. Llegamos cuando decimos que llegaremos. Disciplina y compromiso.
              </p>
            </div>
            {/* Valor 3 */}
            <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-ocean-light/10 text-ocean-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Trato Humano</h3>
              <p className="text-gray-600">
                Empresa familiar con 3 generaciones de experiencia. Entendemos el valor sentimental de tus cosas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN MISIÓN Y VISIÓN */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-cadena-dark mb-6">Nuestra Filosofía</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-cadena-blue mb-2">Misión</h3>
                <p className="text-gray-600 leading-relaxed">
                  Hacer de tu mudanza algo fácil y sencillo, cuidando tu patrimonio de principio a fin, brindando tranquilidad en cada traslado nacional.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-cadena-pink mb-2">Visión</h3>
                <p className="text-gray-600 leading-relaxed">
                  Llegar a cada rincón de la República Mexicana, ofreciendo el mismo cuidado y eficiencia en cada uno de nuestros servicios, consolidándonos como líderes del sector.
                </p>
              </div>
            </div>
            
            {/* Aquí podrías poner otra foto, por ahora un cuadro de color decorativo */}
            <div className="h-80 bg-gradient-to-br from-cadena-blue to-ocean-dark rounded-2xl shadow-2xl flex items-center justify-center text-white p-8 text-center">
              <div>
                <span className="text-6xl font-bold block mb-2">+60</span>
                <span className="text-xl">Años de trayectoria familiar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;