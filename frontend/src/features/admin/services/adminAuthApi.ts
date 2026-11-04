// src/features/admin/services/adminAuthApi.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api/admin', // Apunta al grupo admin en NestJS (exento de tenants)
});

export const adminAuthApi = {
  async login(email: string, password: string) {
    const { data } = await API.post('/auth/login', { email, password });
    return data; // Retorna el access_token y los datos del usuario
  },
};