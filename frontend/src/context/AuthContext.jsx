import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Inicialización Segura
  useEffect(() => {
    const inicializarAuth = () => {
      try {
        const userSaved = localStorage.getItem('posfactura_user');
        const usersList = localStorage.getItem('posfactura_usuarios_list');

        // Si la "DB" de usuarios no existe, creamos el admin inicial
        if (!usersList) {
          const defaultAdmin = [
            { 
              id: 1, 
              nombre: 'Admin Junior', 
              username: 'admin', 
              email: 'admin@techtwosolution.com', 
              password: '1234', 
              rol: 'admin', 
              estado: 'activo' 
            }
          ];
          localStorage.setItem('posfactura_usuarios_list', JSON.stringify(defaultAdmin));
        }

        if (userSaved && userSaved !== "undefined") {
          setUsuario(JSON.parse(userSaved));
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
  const login = useCallback((identifier, password) => {
    try {
      const savedUsers = localStorage.getItem('posfactura_usuarios_list');
      const usuariosMaster = savedUsers ? JSON.parse(savedUsers) : [];

      // Buscamos coincidencia por correo o por username
      const userMatch = usuariosMaster.find(u => 
        (u.email?.toLowerCase() === identifier.toLowerCase() || 
         u.username?.toLowerCase() === identifier.toLowerCase()) && 
        u.password === password
      );

      if (userMatch) {
        if (userMatch.estado === 'inactivo') {
          return { success: false, message: 'Usuario suspendido por administración.' };
        }

        setUsuario(userMatch);
        localStorage.setItem('posfactura_user', JSON.stringify(userMatch));
        return { success: true };
      }

      return { success: false, message: 'Credenciales incorrectas.' };
    } catch (e) {
      return { success: false, message: 'Error técnico en el login.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem('posfactura_user');
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};