// ClienteContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ClienteContext = createContext();

export const ClienteProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { usuario } = useAuth();

  // Construimos la URL de la API basándonos en la configuración de entorno o fallback local
  const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('inventario.oneredrd.com') 
    ? '/api' 
    : (import.meta.env.VITE_API_URL || '/api');

  const API_URL = `${API_BASE_URL}/clients`;

  const getAuthHeaders = useCallback(() => {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('posfactura_token'); // Asumiendo que el token se guarda con esta clave
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (usuario && usuario.id) {
      headers['x-user-id'] = usuario.id;
      headers['x-user-role'] = usuario.rol;
    }
    return headers;
  }, [usuario]);

  // 1. Cargar clientes desde la base de datos al iniciar
  const cargarClientes = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al obtener clientes del servidor');
      const data = await res.json();
      const clientesActivos = Array.isArray(data) ? data.filter(c => c.isActive !== false) : [];
      setClientes(clientesActivos);
    } catch (err) {
      console.error("Error en cargarClientes:", err);
    } finally {
      setLoading(false);
    }
  }, [usuario, API_URL, getAuthHeaders]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // 2. Agregar cliente en la DB
  const agregarCliente = async (nuevo) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(nuevo)
      });
      if (!res.ok) throw new Error('Error al crear cliente');
      const data = await res.json();
      setClientes(prev => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // 3. Actualizar cliente en la DB
  const actualizarCliente = async (editado) => {
    try {
      const { id, ...datos } = editado;
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(datos)
      });
      if (!res.ok) throw new Error('Error al actualizar cliente');
      const data = await res.json();
      setClientes(prev => prev.map(c => c.id === data.id ? data : c).sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // 4. Eliminar cliente en la DB
  const eliminarCliente = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json().catch(() => ({})); // Siempre intentar leer el JSON
      if (!res.ok) { // Si la respuesta no es OK, lanzar un error
        throw new Error(data.message || `Error al eliminar cliente: ${res.status}`);
      }
      setClientes(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      throw err; // Propaga el error para que el componente lo capture
    }
  };

  return (
    <ClienteContext.Provider value={{ clientes, loading, agregarCliente, actualizarCliente, eliminarCliente, recargarClientes: cargarClientes }}>
      {children}
    </ClienteContext.Provider>
  );
};

export const useClientes = () => useContext(ClienteContext);
