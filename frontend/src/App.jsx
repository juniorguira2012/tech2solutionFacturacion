import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Layout } from './components/Layout';
import { InactivityModal } from './components/InactivityModal';
import { VentasProvider } from './context/VentasContext';
import { InventarioProvider } from './context/InventarioContext';
import { ClienteProvider } from './context/ClienteContext';
import { UsuariosProvider } from './context/UsuariosContext';

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

// --- 1. COMPONENTE DE PROTECCIÓN MEJORADO ---

const PrivateRoute = ({ children, moduloRequerido }) => {
  const { usuario, permisos, loading } = useAuth();

  if (loading) return null; 

  // Si no hay usuario, al Login
  if (!usuario) return <Navigate to="/login" replace />;

  // VERIFICACIÓN DE ROLES DESDE EL CONTEXTO (DB)
  if (usuario.rol !== 'admin' && moduloRequerido) {
    if (!permisos) {
      return null; 
    }

    // 🚀 CORRECCIÓN AQUÍ: Agregamos ".modules" antes de buscar el módulo requerido
    const nivelPermiso = permisos.modules?.[moduloRequerido];
    
    if (!nivelPermiso?.view) {
      console.warn(`⚠️ Acceso denegado a ${moduloRequerido} para el rol ${usuario.rol}`);
      return <Navigate to="/" replace />;
    }
  }

  // Si pasó las pruebas, mostramos el Layout + Contenido
  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
  const { usuario, loading } = useAuth();
  // 💡 FIX: No retornamos `null` durante la carga.
  // Dejamos que el componente hijo (Login) decida qué mostrar.
  // Solo redirigimos si la carga ha finalizado y hay un usuario.
  if (!loading && usuario) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// --- 2. COMPONENTE PRINCIPAL ---

const AppContent = () => {
  const { showIdleModal, countdown, stayActive, handleIdleLogout } = useAuth();
  return (
    <>
      <InactivityModal 
        isOpen={showIdleModal}
        countdown={countdown}
        onStay={stayActive}
        onLogout={handleIdleLogout}
      />
      {/* El resto de tu aplicación se renderiza aquí */}
    </>
  );
};

function App() {
  // console.log("🔍 ¿Qué ID está leyendo Vite?:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <VentasProvider>
          <UsuariosProvider>
            <InventarioProvider>
              <ClienteProvider>
                <AppContent />
                <Router>
                  <Routes>
                    {/* RUTA PÚBLICA */}
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                  <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

                  {/* RUTAS PROTEGIDAS CON "moduloRequerido" */}
                  <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                  
                  <Route path="/ventas" element={
                    <PrivateRoute moduloRequerido="ventas"><Ventas /></PrivateRoute>
                  } />
                  
                  <Route path="/historialventas" element={
                    <PrivateRoute moduloRequerido="ventas"><HistorialVentas /></PrivateRoute>
                  } />
                  
                  <Route path="/inventario" element={
                    <PrivateRoute moduloRequerido="inventario"><Inventario /></PrivateRoute>
                  } />
                  
                  <Route path="/clientes" element={
                    <PrivateRoute moduloRequerido="clientes"><Clientes /></PrivateRoute>
                  } />
                  
                  <Route path="/reportes" element={
                    <PrivateRoute moduloRequerido="reportes"><Reportes /></PrivateRoute>
                  } />

                  {/* SEGURIDAD TOTAL: Solo el Admin suele entrar a estos */}
                  <Route path="/configuracion" element={
                    <PrivateRoute moduloRequerido="configuracion"><Configuracion /></PrivateRoute>
                  } />
                  
                  <Route path="/usuarios" element={
                    <PrivateRoute moduloRequerido="configuracion"><Usuarios /></PrivateRoute>
                  } />
                  
                  <Route path="/roles" element={
                    <PrivateRoute moduloRequerido="configuracion"><RolesManager /></PrivateRoute>
                  } />
                      
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                </Router>
              </ClienteProvider>
            </InventarioProvider>
          </UsuariosProvider>
        </VentasProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}


export default App;