import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. La Barra de Navegación siempre arriba */}
      <Navbar />

      {/* 2. El contenido de cada página (Home, Servicios, etc.) cambia aquí */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 3. El Footer siempre abajo */}
      <Footer />
    </div>
  );
};

export default MainLayout;