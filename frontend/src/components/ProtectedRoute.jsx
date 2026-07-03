import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, moduloRequerido }) => {
  const { usuario, loading } = useAuth();

  if (loading) return null; // O un spinner de carga

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  // Si es admin, siempre tiene acceso.
  if (usuario.rol === 'admin') {
    return children;
  }

  // Cargamos la configuración de roles que AuthContext mantiene actualizada en localStorage.
  const savedRoles = localStorage.getItem('posfactura_roles_config');
  const rolesConfig = savedRoles ? JSON.parse(savedRoles) : null;

  // Verificamos si el rol del usuario tiene permiso para ver el módulo requerido.
  if (rolesConfig && rolesConfig[usuario.rol]) {
    const moduloPermisos = rolesConfig[usuario.rol].modules?.[moduloRequerido];
    if (!moduloPermisos?.view) {
      console.warn(`Acceso denegado a ${moduloRequerido} para el rol ${usuario.rol}`);
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;