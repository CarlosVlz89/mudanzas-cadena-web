import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Páginas del Sitio Web Público
import Home from './pages/website/Home';
import Services from './pages/website/Services';
import Tracking from './pages/website/Tracking';
import Booking from './pages/website/Booking';
import Contract from './pages/website/Contract';

// Páginas del Sistema Administrativo (App)
import Login from './pages/app/Login';        // <-- ¡Esta era la que faltaba!
import Dashboard from './pages/app/Dashboard'; // <-- Y esta es la nueva
import WorkOrder from './pages/app/WorkOrder';

function App() {
  return (
    <Routes>
      {/* 1. RUTAS PÚBLICAS (Usan el MainLayout con Navbar y Footer) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="servicios" element={<Services />} />
        <Route path="rastreo" element={<Tracking />} />
        <Route path="cotizar" element={<Booking />} />
      </Route>

      {/* 2. RUTAS DEL SISTEMA (No tienen el menú público) */}
      <Route path="/admin" element={<Login />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/contrato/:id" element={<Contract />} />
      <Route path="/trabajadores" element={<WorkOrder />} />
      
    </Routes>
  );
}

export default App;