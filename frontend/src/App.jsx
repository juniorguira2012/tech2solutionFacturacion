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

<<<<<<< HEAD
=======
// 💡 FIX: Fallback seguro si la variable no está configurada en .env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "000000000000-dummyclientid.apps.googleusercontent.com";

>>>>>>> f8b858b (Carga de Serials correctaente)
// --- 1. COMPONENTE DE PROTECCIÓN MEJORADO ---

const PrivateRoute = ({ children, moduloRequerido }) => {
  const { usuario, permisos, loading } = useAuth();

  if (loading) return null; 

<<<<<<< HEAD
  // Si no hay usuario, al Login
  if (!usuario) return <Navigate to="/login" replace />;

  // VERIFICACIÓN DE ROLES DESDE EL CONTEXTO (DB)
=======
  if (!usuario) return <Navigate to="/login" replace />;

>>>>>>> f8b858b (Carga de Serials correctaente)
  if (usuario.rol !== 'admin' && moduloRequerido) {
    if (!permisos) {
      return null; 
    }

<<<<<<< HEAD
    // 🚀 CORRECCIÓN AQUÍ: Agregamos ".modules" antes de buscar el módulo requerido
=======
>>>>>>> f8b858b (Carga de Serials correctaente)
    const nivelPermiso = permisos.modules?.[moduloRequerido];
    
    if (!nivelPermiso?.view) {
      console.warn(`⚠️ Acceso denegado a ${moduloRequerido} para el rol ${usuario.rol}`);
      return <Navigate to="/" replace />;
    }
  }

<<<<<<< HEAD
  // Si pasó las pruebas, mostramos el Layout + Contenido
=======
>>>>>>> f8b858b (Carga de Serials correctaente)
  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
  const { usuario, loading } = useAuth();
<<<<<<< HEAD
  // 💡 FIX: No retornamos `null` durante la carga.
  // Dejamos que el componente hijo (Login) decida qué mostrar.
  // Solo redirigimos si la carga ha finalizado y hay un usuario.
=======
>>>>>>> f8b858b (Carga de Serials correctaente)
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
<<<<<<< HEAD
      {/* El resto de tu aplicación se renderiza aquí */}
=======
>>>>>>> f8b858b (Carga de Serials correctaente)
    </>
  );
};

function App() {
<<<<<<< HEAD
  // console.log("🔍 ¿Qué ID está leyendo Vite?:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
=======
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
>>>>>>> f8b858b (Carga de Serials correctaente)
      <AuthProvider>
        <VentasProvider>
          <UsuariosProvider>
            <InventarioProvider>
              <ClienteProvider>
                <AppContent />
                <Router>
                  <Routes>
<<<<<<< HEAD
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
=======
                    {/* RUTAS PÚBLICAS */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                    <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

                    {/* RUTAS PROTEGIDAS */}
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
>>>>>>> f8b858b (Carga de Serials correctaente)
                </Router>
              </ClienteProvider>
            </InventarioProvider>
          </UsuariosProvider>
        </VentasProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

<<<<<<< HEAD

=======
>>>>>>> f8b858b (Carga de Serials correctaente)
export default App;