import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const UsuariosContext = createContext();

export const UsuariosProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const { usuario } = useAuth();

  // Construimos la URL de la API basándonos en la configuración de entorno o fallback local
  const API_BASE_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname || '127.0.0.1'}:3000`).split('/products')[0].replace(/\/$/, '');
  const API_URL = `${API_BASE_URL}/users`;

  const getAuthHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-user-id': usuario?.id || '',
    'x-user-role': usuario?.rol || '',
  }), [usuario]);

  // 1. Cargar usuarios desde la base de datos (Backend)
  const cargarUsuarios = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al obtener usuarios del servidor');
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error en cargarUsuarios:", err);
    } finally {
      setLoading(false);
    }
  }, [usuario, API_URL, getAuthHeaders]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // 2. Agregar usuario en la DB
  const agregarUsuario = async (nuevo) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(nuevo)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear usuario');
      }
      const data = await res.json();
      setUsuarios(prev => [...prev, data]);
      return true;
    } catch (err) {
      console.error("Error al agregar usuario:", err);
      throw err;
    }
  };

  // 3. Actualizar usuario en la DB
  const actualizarUsuario = async (editado) => {
    try {
      const { id, ...datos } = editado;
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(datos)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar usuario');
      }
      const data = await res.json();
      setUsuarios(prev => prev.map(u => u.id === data.id ? data : u));
      return true;
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      throw err;
    }
  };

  // 4. Eliminar usuario en la DB
  const eliminarUsuario = async (id) => {
    if (id === 1 || id === usuario?.id) return alert("No puedes eliminar al administrador principal ni a tu mismo.");
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('No se pudo eliminar el usuario');
      setUsuarios(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <UsuariosContext.Provider value={{ 
      usuarios, 
      loading, 
      agregarUsuario, 
      actualizarUsuario, 
      eliminarUsuario, 
      recargarUsuarios: cargarUsuarios 
    }}>
      {children}
    </UsuariosContext.Provider>
  );
};

export const useUsuarios = () => useContext(UsuariosContext);