/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axiosClient from '../api/axiosClient';

const ClienteContext = createContext();

export const ClienteProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { usuario } = useAuth();

  // 1. Cargar clientes desde la base de datos al iniciar utilizando axiosClient
  const cargarClientes = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      // 🚀 axiosClient ya maneja baseURL, token, tenant y cabeceras automáticamente
      const res = await axiosClient.get('/clients');
      const data = res.data;
      const clientesArray = Array.isArray(data) ? data : (data?.data || []);
      const clientesActivos = clientesArray.filter(c => c.isActive !== false);
      
      setClientes(clientesActivos);
    } catch (err) {
      console.error("Error en cargarClientes:", err.response?.data?.message || err.message);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // 2. Agregar cliente en la DB con axiosClient
  const agregarCliente = async (nuevo) => {
    try {
      const res = await axiosClient.post('/clients', nuevo);
      const data = res.data?.data || res.data;
      
      setClientes(prev => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const mensajeObj = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al crear cliente:", mensajeObj);
      throw new Error(mensajeObj || 'Error al crear cliente');
    }
  };

  // 3. Actualizar cliente en la DB con axiosClient
  const actualizarCliente = async (editado) => {
    try {
      const { id, ...datos } = editado;
      const res = await axiosClient.patch(`/clients/${id}`, datos);
      const data = res.data?.data || res.data;
      
      setClientes(prev => prev.map(c => c.id === data.id ? data : c).sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const mensajeObj = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;

      console.error("Error al actualizar cliente:", mensajeObj);
      throw new Error(mensajeObj || 'Error al actualizar cliente');
    }
  };

  // 4. Eliminar cliente en la DB con axiosClient
  const eliminarCliente = async (id) => {
    try {
      await axiosClient.delete(`/clients/${id}`);
      setClientes(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const mensajeObj = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;

      console.error("Error al eliminar cliente:", mensajeObj);
      throw new Error(mensajeObj || 'Error al eliminar cliente');
    }
  };

  return (
    <ClienteContext.Provider value={{ clientes, loading, agregarCliente, actualizarCliente, eliminarCliente, recargarClientes: cargarClientes }}>
      {children}
    </ClienteContext.Provider>
  );
};

export const useClientes = () => useContext(ClienteContext);