// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Aquí puedes validar tu token de autenticación o el rol de administrador maestro
  // Ejemplo simulado: revisamos si existe un token o flag en localStorage
  const isAuthenticatedAsMaster = localStorage.getItem('master_token') !== null;

  // Si no está autenticado, lo redirigimos al login de administración
  if (!isAuthenticatedAsMaster) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};