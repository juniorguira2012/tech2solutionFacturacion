/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axiosClient from '../api/axiosClient';

const VentasContext = createContext();

// El VentasProvider se encarga de manejar el historial de ventas y registrar nuevas ventas.
export const VentasProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [historialVentas, setHistorialVentas] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Función para cargar el historial desde el backend utilizando axiosClient de forma limpia
  const cargarHistorialVentas = useCallback(async () => {
    if (!usuario) return; // No hacer nada si no hay usuario

    setLoading(true);
    try {
      // 🚀 axiosClient ya maneja la baseURL, el token, el x-tenant-id dinámico y los permisos por interceptor
      const res = await axiosClient.get('/sales');
      setHistorialVentas(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error cargando historial de ventas:", error.response?.data?.message || error.message);
      setHistorialVentas([]); 
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  // 2. Cargar el historial cuando el componente se monta o el usuario cambia
  useEffect(() => {
    cargarHistorialVentas();
  }, [cargarHistorialVentas]);

  const registrarVenta = async (nuevaVenta) => {
    try {
      // 🚀 Utilizamos axiosClient.post asegurando que viajen todas las credenciales y tenant del cliente actual
      const res = await axiosClient.post('/sales', nuevaVenta);

      // Recargamos el historial desde la base de datos para sincronizar
      await cargarHistorialVentas();
      return { success: true, venta: res.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      const mensajeFinal = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
      console.error("Error al registrar venta:", mensajeFinal);
      return { success: false, error: mensajeFinal };
    }
  };

  return (
    <VentasContext.Provider value={{ historialVentas, loading, registrarVenta, recargarVentas: cargarHistorialVentas }}>
      {children}
    </VentasContext.Provider>
  );
};

export const useVentas = () => useContext(VentasContext);