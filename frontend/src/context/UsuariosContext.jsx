/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axiosClient from '../api/axiosClient';

const UsuariosContext = createContext();

export const UsuariosProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { usuario } = useAuth();

  // Construimos la URL de la API basándonos en la configuración de entorno o fallback local
  const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('ventas.muebleshabitat.com') 
    ? '/api' 
    : (import.meta.env.VITE_API_URL || '/api');
    
  const API_URL = `${API_BASE_URL}/users`;
  
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('posfactura_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'x-user-id': usuario?.id || '',
      'x-user-role': usuario?.rol || '',
    };
  }, [usuario]);

  const cargarUsuarios = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      // 💡 Con axiosClient no necesitamos pasar getAuthHeaders manualmente
      const res = await axiosClient.get(API_URL);
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error en cargarUsuarios:", err);
    } finally {
      setLoading(false);
    }
  }, [usuario, API_URL]);

  const cargarRoles = useCallback(async () => {
    if (!usuario) return;
    try {
      // 💡 axiosClient inyecta el token y el tenant automáticamente
      const res = await axiosClient.get(`${API_BASE_URL}/roles`);
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar roles:", err);
    }
  }, [usuario, API_BASE_URL]);

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, [cargarUsuarios, cargarRoles]);

  // 2. Agregar usuario en la DB
  const agregarUsuario = async (nuevo) => {
    try {
      // 💡 Con axiosClient, la respuesta exitosa viene directamente en res.data
      const res = await axiosClient.post(API_URL, nuevo);
      const data = res.data;

      setUsuarios(prev => {
        const existeEnLista = prev.some(u => u.id === data.id);
        if (existeEnLista) {
          return prev.map(u => u.id === data.id ? data : u);
        }
        return [...prev, data];
      });
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const mensaje = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al agregar usuario:", mensaje);
      throw new Error(mensaje || 'Error al crear usuario');
    }
  };

  // 3. Actualizar usuario en la DB
  const actualizarUsuario = async (id, payload) => {
    try {
      // 🛡️ Blindaje contra [object Object] en el parámetro
      const cleanId = typeof id === 'object' ? id.id : id;
      const res = await axiosClient.patch(`/users/${cleanId}`, payload);
      const data = res.data;

      setUsuarios(prev => prev.map(u => Number(u.id) === Number(cleanId) ? data : u));
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al actualizar usuario:", message);
      throw new Error(message || 'Error al actualizar usuario');
    }
  };
  // 4. Desactivar usuario sin borrarlo de la DB
  const eliminarUsuario = async (id) => {
    const targetUser = usuarios.find(u => u.id === id);
    const SUPER_USER_EMAIL = 'techtwosolution2@gmail.com';

    if (id === usuario?.id) return false;

    if (targetUser?.rol === 'admin' && usuario?.email !== SUPER_USER_EMAIL) {
      return false;
    }

    try {
      // 💡 Migramos también el delete a axiosClient
      const res = await axiosClient.delete(`${API_URL}/${id}`);
      const data = res.data;

      setUsuarios(prev => prev.map(u => u.id === data.id ? data : u));
      return true;
    } catch (err) {
      console.error("Error al desactivar usuario:", err);
      return false;
    }
  };

  return (
    <UsuariosContext.Provider value={{ 
      usuarios, 
      roles,
      loading, 
      agregarUsuario, 
      actualizarUsuario, 
      eliminarUsuario, 
      recargarUsuarios: cargarUsuarios,
      recargarRoles: cargarRoles
    }}>
      {children}
    </UsuariosContext.Provider>
  );
};

export const useUsuarios = () => useContext(UsuariosContext);
