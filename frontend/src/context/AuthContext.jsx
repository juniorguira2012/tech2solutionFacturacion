import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { modulos as listaModulos } from '../pages/RolesManager'; // Importamos la lista de módulos
import axiosClient from '../api/axiosClient'; // Importamos el cliente de Axios configurado

const AuthContext = createContext();

// 💡 Tiempos para el control de inactividad
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos
const COUNTDOWN_DURATION_SECONDS = 60; // 60 segundos

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permisos, setPermisos] = useState(null);
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION_SECONDS);
  const idleTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const cargarPermisos = useCallback(async (rolName, forceReload = false) => {
    let rolesConfig = null;
    if (!forceReload) {
      try {
        const savedRoles = localStorage.getItem('posfactura_roles_config');
        if (savedRoles) {
          rolesConfig = JSON.parse(savedRoles);
          if (rolesConfig[rolName]) {
            return rolesConfig[rolName];
          }
        }
      } catch (e) {
        console.error("Error al parsear roles de localStorage:", e);
        localStorage.removeItem('posfactura_roles_config');
      }
    }

    try {
      const res = await axiosClient.get('/roles');
      const roles = res.data;

      const newRolesMap = Object.fromEntries(roles.map(r => [r.name, r.config]));
      localStorage.setItem('posfactura_roles_config', JSON.stringify(newRolesMap));
      
      const miRol = roles.find(r => r.name === rolName);
      if (miRol) {
        return miRol.config;
      }
      
      if (rolName === 'admin' && listaModulos && !miRol) {
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
        return { modules: adminPermissions, viewScope: 'all' };
      }
      
      return null;
    } catch (error) {
      console.error("Error cargando permisos:", error);
      return null;
    }
  }, []);

  // Logout limpio
  const logout = useCallback(() => {
    setUsuario(null);
    setPermisos(null);
    localStorage.removeItem('posfactura_user');
    localStorage.removeItem('posfactura_token'); 
  }, []);

 // 🌟 VERIFICACIÓN Y REHIDRATACIÓN LOCAL DIRECTA (Sin validate-token remoto)
  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('posfactura_token');
    const userSaved = localStorage.getItem('posfactura_user');

    if (!token || !userSaved || userSaved === "undefined") {
      setUsuario(null);
      setPermisos(null);
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userSaved);
      // Restauramos el usuario inmediatamente en memoria
      setUsuario(user);
      
      // Cargamos los permisos correspondientes
      const config = await cargarPermisos(user.rol, false);
      setPermisos(config);
    } catch (e) {
      console.error("Error al rehidratar sesión local:", e);
      logout();
    } finally {
      // Apagamos el spinner global para mostrar la aplicación
      setLoading(false);
    }
  }, [cargarPermisos, logout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const recargarPermisos = useCallback(async () => {
    if (!usuario?.rol) return null;
    localStorage.removeItem('posfactura_roles_config');
    const config = await cargarPermisos(usuario.rol, true);
    setPermisos(config);
    return config;
  }, [usuario?.rol, cargarPermisos]);

  // Control de inactividad
  const clearTimers = () => {
    clearTimeout(idleTimerRef.current);
    clearInterval(countdownTimerRef.current);
  };

  const handleIdleLogout = useCallback(() => {
    clearTimers();
    setShowIdleModal(false);
    logout();
  }, [logout]);

  const startCountdown = useCallback(() => {
    setShowIdleModal(true);
    setCountdown(COUNTDOWN_DURATION_SECONDS);
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleIdleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleIdleLogout]);

  const resetIdleTimer = useCallback(() => {
    clearTimers();
    setShowIdleModal(false);
    idleTimerRef.current = setTimeout(startCountdown, IDLE_TIMEOUT_MS);
  }, [startCountdown]);

  useEffect(() => {
    if (!usuario) {
      clearTimers();
      return;
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const handleActivity = () => resetIdleTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetIdleTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearTimers();
    };
  }, [usuario, resetIdleTimer]);

  const stayActive = () => {
    resetIdleTimer();
  };

  // Función de Login
  const login = useCallback(async (identifier, password) => {
    try {
      localStorage.setItem('current_tenant_subdomain', 'onered');

      const response = await axiosClient.post('/auth/login', {
        email: identifier,
        identifier: identifier,
        password,
      });

      const data = response.data;

      if (data.user || data.id || data.access_token || data.token) { 
        const user = data.user || (data.token || data.access_token ? data : data);
        const tokenReal = data.access_token || data.token || user.token || user.access_token;

        if (user.estado === 'inactivo' || user.isActive === false) {
          return {
            success: false,
            message: 'Usuario suspendido por administración.',
          };
        }

        if(user.access_token) delete user.access_token;
        if(user.token) delete user.token;

        setUsuario(user);

        const config = await cargarPermisos(user.rol);
        setPermisos(config);

        localStorage.setItem('posfactura_user', JSON.stringify(user));
        
        if (tokenReal) {
          localStorage.setItem('posfactura_token', tokenReal);
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
      const errorMsg = error.response?.data?.message || 'Error de conexión con la base de datos.';
      return {
        success: false,
        message: errorMsg,
      };
    }
  }, [cargarPermisos]);

  // Login con Google
  const loginWithGoogle = useCallback(async (googleToken) => {
    try {
      const response = await axiosClient.post('/auth/google-login', { token: googleToken });
      const data = response.data;

      if (data.user && data.access_token) {
        const { user, access_token } = data;

        if (user.estado === 'inactivo' || user.isActive === false) {
          return { success: false, message: 'Tu cuenta ha sido suspendida por un administrador.' };
        }

        setUsuario(user);
        const config = await cargarPermisos(user.rol);
        setPermisos(config);

        localStorage.setItem('posfactura_user', JSON.stringify(user));
        localStorage.setItem('posfactura_token', access_token);

        return { success: true };
      }

      return { success: false, message: 'Respuesta inesperada del servidor.' };
    } catch (error) {
      console.error('Error en loginWithGoogle:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión al intentar validar con Google.',
      };
    }
  }, [cargarPermisos]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('posfactura_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);
  
  return (
    <AuthContext.Provider value={{ usuario, permisos, login, loginWithGoogle, logout, loading, getAuthHeaders, recargarPermisos, showIdleModal, countdown, stayActive, handleIdleLogout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};