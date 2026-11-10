// src/components/MasterProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

export const MasterProtectedRoute: React.FC<Props> = ({ children }) => {
  const masterToken = localStorage.getItem('master_token');

  if (!masterToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};