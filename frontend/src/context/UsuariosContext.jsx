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

  // 1. Cargar usuarios desde la base de datos (Backend)
  const cargarUsuarios = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const res = await axiosClient.get(API_URL, { headers: getAuthHeaders() });
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error en cargarUsuarios:", err);
    } finally {
      setLoading(false);
    }
  }, [usuario, API_URL, getAuthHeaders]);

  const cargarRoles = useCallback(async () => {
    if (!usuario) return;
    try {
      // 💡 Cambiamos fetch por axiosClient para heredar automáticamente las cabeceras del tenant y token
      const res = await axiosClient.get(`${API_BASE_URL}/roles`, {
        headers: {
          'x-user-id': usuario?.id || '',
          'x-user-role': usuario?.rol || '',
        }
      });
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
      const res = await axiosClient.post(API_URL, nuevo, { headers: getAuthHeaders() });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const mensaje = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        throw new Error(mensaje || 'Error al crear usuario');
      }
      const data = await res.json();
      setUsuarios(prev => {
        const existeEnLista = prev.some(u => u.id === data.id);
        if (existeEnLista) {
          return prev.map(u => u.id === data.id ? data : u);
        }
        return [...prev, data];
      });
      return data;
    } catch (err) {
      console.error("Error al agregar usuario:", err);
      throw err;
    }
  };

  // 3. Actualizar usuario en la DB
  const actualizarUsuario = async (editado) => {
    try {
      const { id, ...datosAEnviar } = editado;
      const res = await axiosClient.patch(`${API_URL}/${id}`, datosAEnviar, { headers: getAuthHeaders() });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const mensaje = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        throw new Error(mensaje || 'Error al actualizar usuario');
      }
      const data = await res.json();
      setUsuarios(prev => prev.map(u => u.id === data.id ? data : u));
      return true;
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      throw err;
    }
  };

  // 4. Desactivar usuario sin borrarlo de la DB
  const eliminarUsuario = async (id) => {
    const targetUser = usuarios.find(u => u.id === id);
    const SUPER_USER_EMAIL = 'techtwosolution2@gmail.com';

    if (id === usuario?.id) return false;

    // Validación de Super Usuario para eliminar otros Admins
    if (targetUser?.rol === 'admin' && usuario?.email !== SUPER_USER_EMAIL) {
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('No se pudo desactivar el usuario');
      const data = await res.json();
      setUsuarios(prev => prev.map(u => u.id === data.id ? data : u));
      return true;
    } catch (err) {
      console.error(err);
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
