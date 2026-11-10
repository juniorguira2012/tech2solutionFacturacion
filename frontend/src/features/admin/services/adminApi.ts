import axios from 'axios';
import { Tenant, CreateTenantDto } from '../types/tenant.types';

const API = axios.create({
  baseURL: 'http://localhost:3000/api/admin',
});

// Interceptor para enviar el token maestro
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('master_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  getTenants: async (): Promise<Tenant[]> => {
    const { data } = await API.get('/tenants');
    return data;
  },

  createTenant: async (dto: CreateTenantDto): Promise<Tenant> => {
    const { data } = await API.post('/tenants', dto);
    return data;
  },

  updateTenantStatus: async (id: string, isActive: boolean): Promise<Tenant> => {
    const { data } = await API.patch(`/tenants/${id}/status`, { isActive });
    return data;
  },
  // En src/services/adminApi.ts

  updateTenant: async (id: string, data: { name?: string; subdomain?: string }): Promise<Tenant> => {
    const { data: response } = await API.put(`/tenants/${id}`, data);
    return response;
  },

  resetTenantPassword: async (tenantId: string, newPassword: string): Promise<void> => {
    await API.post(`/tenants/${tenantId}/reset-password`, { newPassword });
  },


  async updateAdminProfile(data: { id: string; name?: string; email?: string; newPassword?: string }) {
    // 👇 Leemos 'master_token' tal como lo guardaste en el login
    const token = localStorage.getItem('master_token'); 

    const response = await fetch('http://localhost:3000/api/admin/auth/profile', { // 👈 Añadimos '/api' si tu backend usa ese prefijo global
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Opcional: puedes leer el error exacto que manda el backend
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar el perfil del administrador');
    }

    return await response.json();
  }
};