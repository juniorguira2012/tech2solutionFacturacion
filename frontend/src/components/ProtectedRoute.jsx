import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, moduloRequerido }) => {
  const { usuario, loading } = useAuth();

  if (loading) return null; // O un spinner de carga

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  // 1. Cargamos la configuración de roles del localStorage
  const savedRoles = localStorage.getItem('posfactura_roles_config');
  const rolesConfig = savedRoles ? JSON.parse(savedRoles) : null;

  // 2. Si hay una configuración para el rol del usuario, verificamos el módulo
  if (rolesConfig && rolesConfig[usuario.rol]) {
    const permiso = rolesConfig[usuario.rol].modules[moduloRequerido];
    
    // Si el permiso es 'none' (Bloqueado), lo mandamos al inicio
    if (permiso === 'none') {
      console.warn(`Acceso denegado a ${moduloRequerido} para el rol ${usuario.rol}`);
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;