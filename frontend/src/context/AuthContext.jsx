/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permisos, setPermisos] = useState(null);

  // Calculamos la URL base de la API
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';
  
  // Debug: log para verificar la URL
  console.log('API_BASE_URL:', API_BASE_URL);

  const cargarPermisos = useCallback(async (rolName) => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`);
      if (!res.ok) return null;
      const roles = await res.json();
      const miRol = roles.find(r => r.name === rolName);
      
      if (miRol) return miRol.config;

      // Fallback: Si no hay roles en la DB pero es admin, dar permisos full
      if (rolName === 'admin') {
        return {
          modules: { ventas: 'full', inventario: 'full', reportes: 'full', clientes: 'full', configuracion: 'full' }
        };
      }
      return null;
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
      console.log('Iniciando intento de login para:', identifier);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: identifier,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Esto nos mostrará si el error es "Invalid credentials" o algo más específico
        const msg = errorData.message || 'Error de autenticación';
        console.error('Detalle del error 401:', msg);

        return {
          success: false,
          message: msg || 'Credenciales inválidas o usuario inactivo.',
        };
      }

      const data = await response.json();

      // DEBUG: Para ver qué devuelve el servidor realmente
      console.log("Respuesta login:", data);

      if (data.user || data.id) { // A veces el backend devuelve el user directamente
        const user = data.user || data;
        
        // Según tu SQL, la columna es 'isActive'. Validamos ambas posibilidades.
        if (user.estado === 'inactivo' || user.isActive === false) {
          return {
            success: false,
            message: 'Usuario suspendido por administración.',
          };
        }

        setUsuario(user);

        const config = await cargarPermisos(user.rol);

        setPermisos(config);

        localStorage.setItem(
          'posfactura_user',
          JSON.stringify(user)
        );

        return { success: true };
      }

      return {
        success: false,
        message: 'Credenciales incorrectas.',
      };
    } catch (error) {
      console.error('Error en Login:', error);

      return {
        success: false,
        message: 'Error de conexión con la base de datos.',
      };
    }
  }, [API_BASE_URL, cargarPermisos]);

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
