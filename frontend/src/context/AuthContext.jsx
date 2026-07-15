/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { modulos as listaModulos } from '../pages/RolesManager'; // Importamos la lista de módulos

const AuthContext = createContext();

// 💡 Nuevo: Endpoint para validar token en el backend
//const API_VALIDATE_TOKEN_URL = `${import.meta.env.VITE_API_URL || ''}/auth/validate-token`;

// 💡 NUEVO: Tiempos para el control de inactividad
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

  // 🚨 CORRECCIÓN: Simplificamos la lógica de la URL.
  // VITE_API_URL debe ser la URL completa del backend, ej: http://localhost:3000
  // Si no está definida, se usará una ruta relativa, ideal para producción.
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';
  
  const cargarPermisos = useCallback(async (rolName, forceReload = false) => {
    let rolesConfig = null;
    if (!forceReload) {
      try {
        const savedRoles = localStorage.getItem('posfactura_roles_config');
        if (savedRoles) {
          rolesConfig = JSON.parse(savedRoles);
          // Si el rol ya está en el caché, lo usamos
          if (rolesConfig[rolName]) {
            return rolesConfig[rolName];
          }
        }
      } catch (e) {
        console.error("Error al parsear roles de localStorage:", e);
        localStorage.removeItem('posfactura_roles_config'); // Limpiar caché corrupto
      }
    }

    // Si no está en caché o se fuerza la recarga, vamos a la API
    try {
      const res = await fetch(`${API_BASE_URL}/roles`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('posfactura_token')}` // Aseguramos que se envíe el token
        }
      });
      if (!res.ok) {
        console.error(`Error al cargar roles: ${res.status} ${res.statusText}`);
        return null;
      }
      const roles = await res.json();

      const newRolesMap = Object.fromEntries(roles.map(r => [r.name, r.config]));
      localStorage.setItem('posfactura_roles_config', JSON.stringify(newRolesMap));
      
      const miRol = roles.find(r => r.name === rolName);
      
      if (miRol) {
        return miRol.config;
      }
      // Fallback: Si no hay roles en la DB pero es admin, dar permisos full (solo si no se encontró en DB)
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
        // 🚨 CORRECCIÓN: Devolvemos el objeto de permisos directamente, sin anidarlo en 'modules'.
        return adminPermissions;
      }
      
      return null;
    } catch (error) {
      console.error("Error cargando permisos:", error);
      return null;
    }
  }, [API_BASE_URL]);
  
  //verificar el estado de autenticación al cargar la app
  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('posfactura_token');
    const userSaved = localStorage.getItem('posfactura_user');

    if (!token || !userSaved || userSaved === "undefined") {
      setUsuario(null);
      setPermisos(null);
      setLoading(false);
      return;
    }

    // 🌟 PASO OPTIMISTA: Cargamos al usuario y sus permisos de inmediato.
    // Esto evita que React te redirija al Login mientras el backend responde.
    try {
      const user = JSON.parse(userSaved);
      setUsuario(user);
      
      const config = await cargarPermisos(user.rol, false); // false para usar caché rápido primero
      setPermisos(config);
    } catch (e) {
      console.error("Error al parsear usuario local:", e);
      logout();
      setLoading(false);
      return;
    }

    // Ya tenemos al usuario en pantalla, ahora validamos el token con el backend de forma silenciosa
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn("Token inválido en el servidor. Cerrando sesión.");
        logout(); // Si el token expiró de verdad, limpiamos todo
      } else {
        // Opcional: Si el backend devuelve los datos frescos del usuario, los actualizamos
        const data = await response.json();
        if (data.user) {
          setUsuario(data.user);
          localStorage.setItem('posfactura_user', JSON.stringify(data.user));
        }
      }
    } catch (error) {
      // 🚨 IMPORTANTE: Si es un error de red (ej: se cayó el internet temporalmente),
      // NO saques al usuario de su sesión. Solo adviértelo en consola.
      console.error("Error de conexión al validar token con el servidor:", error);
    } finally {
      // Apagamos el spinner global
      setLoading(false);
    }
  }, [API_BASE_URL, cargarPermisos]);

  // 💡 NUEVO: Función para limpiar todos los temporizadores
  const clearTimers = () => {
    clearTimeout(idleTimerRef.current);
    clearInterval(countdownTimerRef.current);
  };

  // 💡 NUEVO: Función para manejar el logout por inactividad
  const handleIdleLogout = useCallback(() => {
    clearTimers();
    setShowIdleModal(false);
    logout();
  }, []);

  // 💡 NUEVO: Inicia el temporizador de cuenta regresiva del modal
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

  // 💡 NUEVO: Resetea el temporizador principal de inactividad
  const resetIdleTimer = useCallback(() => {
    clearTimers();
    setShowIdleModal(false);
    idleTimerRef.current = setTimeout(startCountdown, IDLE_TIMEOUT_MS);
  }, [startCountdown]);

  // 💡 NUEVO: Efecto que añade y limpia los listeners de actividad del usuario
  useEffect(() => {
    if (!usuario) {
      clearTimers();
      return;
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const handleActivity = () => resetIdleTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetIdleTimer(); // Inicia el temporizador al loguearse

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearTimers();
    };
  }, [usuario, resetIdleTimer]);

  // 💡 Modificamos el useEffect de inicialización para usar checkAuthStatus
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);


  const stayActive = () => {
    resetIdleTimer();
  };

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
          identifier: identifier, //CORRECCIÓN: Usamos 'identifier' que es lo que el backend espera.
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

        //Al hacer login, cargamos los permisos y actualizamos el caché de roles.
        const config = await cargarPermisos(user.rol);
        setPermisos(config);

        //GUARDAR ALMA Y CUERPO EN EL NAVEGADOR
        //Guardamos el usuario y el token por separado.
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

  // Función para el login con Google
  const loginWithGoogle = useCallback(async (googleToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let msg = 'Error de autenticación con Google';
        try {
          const errorJson = JSON.parse(errorText);
          msg = errorJson.message || msg;
        } catch (e) {}
        return { success: false, message: msg };
      }

      const data = await response.json();

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
        message: 'Error de conexión al intentar validar con Google.',
      };
    }
  }, [API_BASE_URL, cargarPermisos]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('posfactura_token');
    return {
      'Content-Type': 'application/json',
      // Si existe el token, añadimos el header de Authorization
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);
  // Logout limpio
  const logout = useCallback(() => {
    setUsuario(null);
    setPermisos(null);
    // 🚀 LIMPIAMOS TODO EL RASTRO VIEJO
    localStorage.removeItem('posfactura_user');
    localStorage.removeItem('posfactura_token'); 
  }, []);
  
  return (
    <AuthContext.Provider value={{ usuario, permisos, login, loginWithGoogle, logout, loading, getAuthHeaders, showIdleModal, countdown, stayActive, handleIdleLogout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
