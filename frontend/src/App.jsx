import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 🌟 1. Importamos TanStack Query
import { Layout } from './components/Layout';
import { InactivityModal } from './components/InactivityModal';
import { VentasProvider } from './context/VentasContext';
import { InventarioProvider } from './context/InventarioContext';
import { ClienteProvider } from './context/ClienteContext';
import { UsuariosProvider } from './context/UsuariosContext';

import {AdminLogin } from './features/admin/pages/AdminLogin';
import {AdminDashboard} from './features/admin/pages/AdminDashboard';
import {MasterProtectedRoute} from './features/admin/components/MasterProtectedRoute';

import Home from './pages/Home';
import Ventas from './pages/Ventas';
import HistorialVentas from './pages/HistorialVentas';
import Inventario from './pages/Inventario';
import Clientes from './pages/Clientes';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import Usuarios from './pages/Usuarios';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RolesManager from './pages/RolesManager';
import AccessDeniedAlert from './components/AccessDeniedAlert';
import Proyectos from './pages/Proyectos';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('dummy')) {
  console.error("⚠️ Falta configurar VITE_GOOGLE_CLIENT_ID con un Client ID válido.");
}

// 🌟 2. Inicializamos el cliente de caché con configuraciones óptimas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Los datos se guardan en caché por 5 minutos frescos
      refetchOnWindowFocus: false, // Evita peticiones innecesarias al cambiar de pestaña
      retry: 1, // Si falla una petición, reintenta solo una vez
    },
  },
});

// --- 1. COMPONENTE DE PROTECCIÓN DE RUTAS ---
const PrivateRoute = ({ children, moduloRequerido }) => {
  const { usuario, permisos, loading } = useAuth();

  if (loading) return null; 

  if (!usuario) return <Navigate to="/login" replace />;

  if (usuario.rol !== 'admin' && moduloRequerido) {
    if (!permisos) return null; 

    const nivelPermiso = permisos.modules?.[moduloRequerido];
    
    if (!nivelPermiso?.view) {
      console.warn(`⚠️ Acceso denegado a ${moduloRequerido} para el rol ${usuario.rol}`);
      return <Layout><AccessDeniedAlert modulo={moduloRequerido} /></Layout>;
    }
  }

  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
  const { usuario, loading } = useAuth();
  
  if (loading) return null; 
  if (usuario) return <Navigate to="/" replace />;
  
  return children;
};

// --- 2. CONTENIDO GLOBAL (MODALES) ---
const AppContent = () => {
  const { showIdleModal, countdown, stayActive, handleIdleLogout } = useAuth();
  return (
    <InactivityModal 
      isOpen={showIdleModal}
      countdown={countdown}
      onStay={stayActive}
      onLogout={handleIdleLogout}
    />
  );
};

// --- 3. COMPONENTE PRINCIPAL ---
function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <VentasProvider>
            <UsuariosProvider>
              <InventarioProvider>
                <ClienteProvider>
                  <Router>
                    <AppContent />
                    
                    <Routes>
                      {/* RUTAS PÚBLICAS */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

                      {/* 🌟 2. RUTA DEL MASTER ADMIN PANEL (Protegida solo para administradores) */}
                      <Route 
                        path="/admin/tenants" 
                        element={
                          <MasterProtectedRoute>
                            <AdminDashboard />
                          </MasterProtectedRoute>
                        } 
                      />

                      {/* RUTAS PROTEGIDAS DEL ERP */}
                      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                      <Route path="/ventas" element={<PrivateRoute moduloRequerido="ventas"><Ventas /></PrivateRoute>} />
                      <Route path="/historialventas" element={<PrivateRoute moduloRequerido="ventas"><HistorialVentas /></PrivateRoute>} />
                      <Route path="/inventario" element={<PrivateRoute moduloRequerido="inventario"><Inventario /></PrivateRoute>} />
                      <Route path="/clientes" element={<PrivateRoute moduloRequerido="clientes"><Clientes /></PrivateRoute>} />
                      <Route path="/reportes" element={<PrivateRoute moduloRequerido="reportes"><Reportes /></PrivateRoute>} />
                      <Route path="/proyectos" element={<PrivateRoute moduloRequerido="proyectos"><Proyectos /></PrivateRoute>} />
                      <Route path="/configuracion" element={<PrivateRoute moduloRequerido="configuracion"><Configuracion /></PrivateRoute>} />
                      <Route path="/usuarios" element={<PrivateRoute moduloRequerido="configuracion"><Usuarios /></PrivateRoute>} />
                      <Route path="/roles" element={<PrivateRoute moduloRequerido="configuracion"><RolesManager /></PrivateRoute>} />
                        
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Router>
                </ClienteProvider>
              </InventarioProvider>
            </UsuariosProvider>
          </VentasProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;