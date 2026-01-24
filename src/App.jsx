import { Routes, Route } from 'react-router-dom';
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

// COMPONENTES UI
import FloatingMascot from './components/ui/FloatingMascot'; // <--- 1. IMPORTAMOS LA MASCOTA

function App() {
  return (
    <Routes>
      {/* 1. RUTAS PÚBLICAS */}
      {/* Aquí agregamos la mascota junto al Layout para que solo salga en el sitio web */}
      <Route path="/" element={
        <>
          <MainLayout />
          <FloatingMascot /> {/* <--- 2. LA AGREGAMOS AQUÍ */}
        </>
      }>
        <Route index element={<Home />} />
        <Route path="servicios" element={<Services />} />
        <Route path="rastreo" element={<Tracking />} />
        <Route path="cotizar" element={<Booking />} />
      </Route>

      {/* 2. RUTAS DEL SISTEMA (Aquí NO sale la mascota, perfecto para el admin) */}
      <Route path="/admin" element={<Login />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/contrato/:id" element={<Contract />} />
      <Route path="/trabajadores" element={<WorkOrder />} />
      
    </Routes>
  );
}

export default App;