import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { Layout } from './components/Layout';
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
import RolesManager from './pages/RolesManager';

// --- 1. COMPONENTE DE PROTECCIÓN MEJORADO ---

const PrivateRoute = ({ children, moduloRequerido }) => {
  const { usuario, permisos, loading } = useAuth();

  if (loading) return null; 

  // Si no hay usuario, al Login
  if (!usuario) return <Navigate to="/login" replace />;

  // VERIFICACIÓN DE ROLES DESDE EL CONTEXTO (DB)
  if (usuario.rol !== 'admin' && moduloRequerido) {
    if (permisos) {
      const nivelPermiso = permisos.modules?.[moduloRequerido];
      
      // Si el permiso es 'none', lo rebotamos al Home (o Dashboard)
      if (nivelPermiso === 'none') {
        console.warn(`⚠️ Acceso denegado a ${moduloRequerido} para el rol ${usuario.rol}`);
        return <Navigate to="/" replace />;
      }
    }
  }

  // Si pasó las pruebas, mostramos el Layout + Contenido
  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
  const { usuario, loading } = useAuth();
  if (loading) return null;
  return usuario ? <Navigate to="/" replace /> : children;
};

// --- 2. COMPONENTE PRINCIPAL ---

function App() {
  return (
    <AuthProvider>
      <VentasProvider>
        <UsuariosProvider>
          <InventarioProvider>
            <ClienteProvider>
              <Router>
                <Routes>
                  {/* RUTA PÚBLICA */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

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
  );
}

export default App;