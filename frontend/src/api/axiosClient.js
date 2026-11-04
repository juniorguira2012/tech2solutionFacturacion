// src/api/axiosClient.js
import axios from 'axios';

const getTenantFromSubdomain = () => {
  const hostname = window.location.hostname; // Ej: "onered.localhost", "muebleshabitat.tech2solution.com", o "localhost"
  const parts = hostname.split('.');
  
  // 1. Si estamos en desarrollo puro sin subdominio (ej: "localhost" o "127.0.0.1"), 
  // puedes usar 'onered' como comodín de pruebas actual.
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'onered'; 
  }
  
  // 2. Si estás usando subdominios locales (ej. "onered.localhost"), extrae la primera parte ("onered")
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return parts[0];
  }
  
  // 3. En producción (ej: "onered.tech2solution.com"), extrae el subdominio real
  if (parts.length >= 3) {
    return parts[0];
  }
  
  // Respaldo por defecto
  return 'onered';
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor para inyectar automáticamente el Tenant y el Token
axiosClient.interceptors.request.use(
  (config) => {
    const tenantId = getTenantFromSubdomain();
    
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
      config.headers['x-tenant-subdomain'] = tenantId;
    }

    const token = localStorage.getItem('posfactura_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;