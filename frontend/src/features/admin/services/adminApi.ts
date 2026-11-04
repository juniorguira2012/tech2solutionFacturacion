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
};