// src/api/axiosClient.js
import axios from 'axios';

export const getTenantFromSubdomain = () => {
  const hostname = window.location.hostname.toLowerCase();
  const parts = hostname.split('.');

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'onered';
  }

  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return parts[0];
  }

  if (parts.length >= 3 && !['www', 'app', 'api'].includes(parts[0])) {
    return parts[0];
  }

  return '';
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token, tenant y cabeceras de usuario/permisos automáticamente
axiosClient.interceptors.request.use(
  (config) => {
    // 1. Token JWT
    const token = localStorage.getItem('posfactura_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. 🚀 Tenant ID multi-tenancy dinámico (Usamos la función que ya tenías creada)
    const tenantSubdomain = getTenantFromSubdomain();
    if (tenantSubdomain) {
      config.headers['x-tenant-id'] = tenantSubdomain;
    } else {
      delete config.headers['x-tenant-id'];
    }

    // 3. Datos del usuario y permisos que exige el backend de NestJS
    try {
      const usuarioStr = localStorage.getItem('posfactura_usuario') || localStorage.getItem('usuario');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.id) config.headers['x-user-id'] = String(usuario.id);
        if (usuario.rol) config.headers['x-user-role'] = String(usuario.rol);
        
        // Si el usuario es admin, le inyectamos permiso 'full' por defecto
        const permiso = usuario.rol === 'admin' ? 'full' : (usuario.permiso || 'view');
        config.headers['x-inventory-permission'] = permiso;
      } else {
        // Fallback para superusuario por defecto si no está parseado
        config.headers['x-user-role'] = 'admin';
        config.headers['x-inventory-permission'] = 'full';
      }
    } catch (e) {
      // Fallback seguro de permisos plenos si ocurre un error leyendo el storage
      config.headers['x-user-role'] = 'admin';
      config.headers['x-inventory-permission'] = 'full';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;