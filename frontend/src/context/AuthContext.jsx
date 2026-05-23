/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permisos, setPermisos] = useState(null);

  // Calculamos la URL base de la API
  const API_BASE_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname || '127.0.0.1'}:3000`).split('/products')[0].replace(/\/$/, '');

  const cargarPermisos = useCallback(async (rolName) => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`);
      if (!res.ok) return null;
      const roles = await res.json();
      const miRol = roles.find(r => r.name === rolName);
      return miRol ? miRol.config : null;
    } catch (error) {
      console.error("Error cargando permisos:", error);
      return null;
    }
  }, [API_BASE_URL]);

  // 1. Inicialización Segura
  useEffect(() => {
    const inicializarAuth = async () => {
      try {
        const userSaved = localStorage.getItem('posfactura_user');

        if (userSaved && userSaved !== "undefined") {
          const user = JSON.parse(userSaved);
          setUsuario(user);
          const config = await cargarPermisos(user.rol);
          setPermisos(config);
        }
      } catch (error) {
        console.error("Error en Auth Init:", error);
      } finally {
        setLoading(false);
      }
    };

    inicializarAuth();
  }, []);

  // 2. Función de Login mejorada
  const login = useCallback(async (identifier, password) => {
    try {
      // Consultamos los usuarios directamente desde el Backend
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error('No se pudo conectar con el servidor');
      
      const usuariosMaster = await response.json();

      // Buscamos coincidencia por correo (La entidad no tiene username)
      const userMatch = usuariosMaster.find(u => {
        const emailMatch = u.email?.trim().toLowerCase() === identifier.trim().toLowerCase();
        const passMatch = String(u.password) === String(password);
        return emailMatch && passMatch;
      });

      if (userMatch) {
        if (userMatch.estado === 'inactivo') {
          return { success: false, message: 'Usuario suspendido por administración.' };
        }

        setUsuario(userMatch);
        const config = await cargarPermisos(userMatch.rol);
        setPermisos(config);
        localStorage.setItem('posfactura_user', JSON.stringify(userMatch));
        return { success: true };
      }

      return { success: false, message: 'Credenciales incorrectas.' };
    } catch (error) {
      console.error("Error en Login:", error);
      return { success: false, message: 'Error de conexión con la base de datos.' };
    }
  }, [API_BASE_URL]);

  const logout = useCallback(() => {
    setUsuario(null);
    setPermisos(null);
    localStorage.removeItem('posfactura_user');
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, permisos, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
