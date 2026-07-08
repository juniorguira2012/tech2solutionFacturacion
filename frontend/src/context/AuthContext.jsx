/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { modulos as listaModulos } from '../pages/RolesManager'; // Importamos la lista de módulos

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permisos, setPermisos] = useState(null);

  // 🚨 CORRECCIÓN: Simplificamos la lógica de la URL.
  // VITE_API_URL debe ser la URL completa del backend, ej: http://localhost:3000
  // Si no está definida, se usará una ruta relativa, ideal para producción.
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';
  
  const cargarPermisos = useCallback(async (rolName) => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`);
      if (!res.ok) return null;
      const roles = await res.json();

      // 🚀 MEJORA 1: Guardamos la configuración completa de roles en localStorage.
      // Esto servirá como un "caché" para que otros componentes puedan leerla.
      if (Array.isArray(roles) && roles.length > 0) {
        const rolesMap = Object.fromEntries(roles.map(r => [r.name, r.config]));
        localStorage.setItem('posfactura_roles_config', JSON.stringify(rolesMap));
      } else {
        localStorage.removeItem('posfactura_roles_config');
      }

      const miRol = roles.find(r => r.name === rolName);
      
      if (miRol) return miRol.config;
      // Fallback: Si no hay roles en la DB pero es admin, dar permisos full
      if (rolName === 'admin' && listaModulos) {
        const adminPermissions = {};
        listaModulos.forEach(modulo => {
          const allActions = { view: true, create: true, edit: true, delete: true };
          const modulePerms = { ...allActions };

          if (modulo.subModulos) {
            modulePerms.subModulos = {};
            modulo.subModulos.forEach(sub => {
              modulePerms.subModulos[sub.id] = { ...allActions };
            });
          }
          adminPermissions[modulo.id] = modulePerms;
        });
        // 🚨 CORRECCIÓN: Devolvemos el objeto de permisos directamente, sin anidarlo en 'modules'.
        return adminPermissions;
      }
      return null;
    } catch (error) {
      console.error("Error cargando permisos:", error);
      return null;
    }
  }, [API_BASE_URL]);

  // Inicialización Segura
  useEffect(() => {
    const inicializarAuth = async () => {
      try {
        const userSaved = localStorage.getItem('posfactura_user');

        if (userSaved && userSaved !== "undefined") {
          const user = JSON.parse(userSaved); // El usuario ya está guardado
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

  // Función de Login mejorada
  const login = useCallback(async (identifier, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: identifier,
          identifier: identifier, // 🚀 CORRECCIÓN: Usamos 'identifier' que es lo que el backend espera.
          password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let msg = 'Error de autenticación';
        try {
          const errorJson = JSON.parse(errorText);
          msg = errorJson.message || msg;
        } catch (e) {}

        return {
          success: false,
          message: response.status === 500 ? 'Error interno en el servidor de pruebas' : msg,
        };
      }

      const data = await response.json();

      if (data.user || data.id || data.access_token || data.token) { 
        const user = data.user || (data.token || data.access_token ? data : data);
        
        // 🚀 CAPTURA DEL TOKEN (Soporta si viene como access_token o token)
        const tokenReal = data.access_token || data.token || user.token || user.access_token;

        if (user.estado === 'inactivo' || user.isActive === false) {
          return {
            success: false,
            message: 'Usuario suspendido por administración.',
          };
        }

        // Limpiamos cualquier propiedad extraña si el user vino mezclado con el token
        if(user.access_token) delete user.access_token;
        if(user.token) delete user.token;

        setUsuario(user);

        // 🚀 MEJORA 2: Al hacer login, cargamos los permisos y actualizamos el caché de roles.
        const config = await cargarPermisos(user.rol);
        setPermisos(config);

        // 🚀 GUARDAR ALMA Y CUERPO EN EL NAVEGADOR
        // Guardamos el usuario y el token por separado.
        localStorage.setItem('posfactura_user', JSON.stringify(user));
        
        if (tokenReal) {
          localStorage.setItem('posfactura_token', tokenReal); // 👈 ¡GUARDAMOS EL PASAPORTE!
        } else {
          console.warn("⚠️ ¡Ojo! El backend no devolvió ningún token en la respuesta.");
        }

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

  // Logout limpio
  const logout = useCallback(() => {
    setUsuario(null);
    setPermisos(null);
    // 🚀 LIMPIAMOS TODO EL RASTRO VIEJO
    localStorage.removeItem('posfactura_user');
    localStorage.removeItem('posfactura_token'); 
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
