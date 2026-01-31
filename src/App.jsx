import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Páginas del Sitio Web Público
import Home from './pages/website/Home';
import Services from './pages/website/Services';
import Tracking from './pages/website/Tracking';
import Booking from './pages/website/Booking';
import Contract from './pages/website/Contract';

// Páginas del Sistema Administrativo (App)
import Login from './pages/app/Login';
import Dashboard from './pages/app/Dashboard';
import WorkOrder from './pages/app/WorkOrder';
import PrintOrder from './pages/app/PrintOrder';

// COMPONENTES UI
import FloatingMascot from './components/ui/FloatingMascot';

// --- 1. COMPONENTE PARA SUBIR AL INICIO AUTOMÁTICAMENTE ---
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <>
      {/* 2. ACTIVAMOS EL SCROLL AUTOMÁTICO */}
      <ScrollToTop />

      <Routes>
        {/* 1. RUTAS PÚBLICAS */}
        <Route path="/" element={
          <>
            <MainLayout />
            <FloatingMascot />
          </>
        }>
          <Route index element={<Home />} />
          <Route path="servicios" element={<Services />} />
          <Route path="rastreo" element={<Tracking />} />
          <Route path="cotizar" element={<Booking />} />
        </Route>

        {/* 2. RUTAS DEL SISTEMA (Sin mascota y sin Layout público) */}
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/contrato/:id" element={<Contract />} />
        <Route path="/trabajadores" element={<WorkOrder />} />
        <Route path="/orden-carga/:id" element={<PrintOrder />} />
      </Routes>
    </>
  );
}

export default App;