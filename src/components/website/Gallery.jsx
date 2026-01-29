// Nota: Ya no necesitamos importar ZoomIn porque quitamos el icono
import { Image } from 'lucide-react';

// 1. IMPORTAMOS LAS 12 IMÁGENES
import m1 from '../../assets/images/mudanza1.jpeg';
import m2 from '../../assets/images/mudanza2.jpeg';
import m3 from '../../assets/images/mudanza3.jpeg';
import m4 from '../../assets/images/mudanza4.jpeg';
import m5 from '../../assets/images/mudanza5.jpeg';
import m6 from '../../assets/images/mudanza6.jpeg';
import m7 from '../../assets/images/mudanza7.jpeg';
import m8 from '../../assets/images/mudanza8.jpeg';
import m9 from '../../assets/images/mudanza9.jpeg';
import m10 from '../../assets/images/mudanza10.jpeg';
import m11 from '../../assets/images/mudanza11.jpeg';
import m12 from '../../assets/images/mudanza12.jpeg';

const Gallery = () => {

  // 2. CONFIGURAMOS EL MOSAICO (GRID)
  // Ya no necesitamos el campo 'title' para mostrarlo, pero lo dejo como 'alt' para accesibilidad
  const images = [
    // Fila 1 y 2 
    { src: m1, span: "md:col-span-2 md:row-span-2", title: "Nuestras Unidades" },
    { src: m2, span: "md:col-span-1 md:row-span-1", title: "Carga Segura" },
    { src: m3, span: "md:col-span-1 md:row-span-2", title: "Maniobras de Altura" }, 
    { src: m4, span: "md:col-span-1 md:row-span-1", title: "Personal Uniformado" },
    // Fila 3
    { src: m5, span: "md:col-span-2 md:row-span-1", title: "Emplayado Profesional" }, 
    { src: m6, span: "md:col-span-1 md:row-span-1", title: "Cuidado al Detalle" },
    { src: m7, span: "md:col-span-1 md:row-span-1", title: "Logística" },
    // Fila 4 
    { src: m8, span: "md:col-span-1 md:row-span-2", title: "Volado de Muebles" }, 
    { src: m9, span: "md:col-span-2 md:row-span-2", title: "Servicio Residencial" }, 
    { src: m10, span: "md:col-span-1 md:row-span-1", title: "Empaque Delicado" },
    // Fila 5
    { src: m11, span: "md:col-span-1 md:row-span-1", title: "Transporte Nacional" },
    { src: m12, span: "md:col-span-4 md:row-span-1", title: "Listos para tu mudanza" }, 
  ];

  return (
    <div className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-16">
          <span className="bg-white/50 px-4 py-1 rounded-full text-cadena-pink font-bold tracking-widest uppercase text-xs border border-white/40 shadow-sm">
            Galería
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mt-4 mb-6">
            Así trabajamos en <span className="text-cadena-blue">Cadena</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Cada mudanza es una historia de éxito. Mira cómo cuidamos el patrimonio de nuestros clientes.
          </p>
        </div>

        {/* GRID MOSAICO LIMPIO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {images.map((img, index) => (
            <div 
              key={index} 
              className={`relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-white/40 ${img.span}`}
            >
              {/* IMAGEN CON ZOOM SUAVE */}
              <img 
                src={img.src} 
                alt={img.title} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
              
              {/* SE ELIMINÓ EL DIV DEL OVERLAY AZUL QUE ESTABA AQUÍ */}

            </div>
          ))}
        </div>
        
        {/* Botón opcional para Instagram si lo quieres, si no, bórralo */}
        <div className="text-center mt-12">
           <a href="https://www.instagram.com/mudanzas.cadena" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cadena-pink font-bold hover:text-pink-700 transition">
             <Image size={20} /> Ver más en Instagram
           </a>
        </div>

      </div>
    </div>
  );
};

export default Gallery;