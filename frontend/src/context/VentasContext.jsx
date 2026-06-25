/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const VentasContext = createContext();
// El VentasProvider se encarga de manejar el historial de ventas y registrar nuevas ventas.
export const VentasProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [historialVentas, setHistorialVentas] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('inventario.oneredrd.com') 
    ? '/api' 
    : (import.meta.env.VITE_API_URL || '/api');
    
  const API_SALES_URL = API_BASE_URL + '/sales';

  // 1. Función para cargar el historial desde el backend
  const cargarHistorialVentas = useCallback(async () => {
    if (!usuario) return; // No hacer nada si no hay usuario

    setLoading(true);
    try {
      const res = await fetch(API_SALES_URL, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': usuario?.id || '',
        },
      });
      if (!res.ok) throw new Error('No se pudo cargar el historial de ventas.');
      const data = await res.json();
      setHistorialVentas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando historial de ventas:", error);
      setHistorialVentas([]); // En caso de error, asegurar que sea un array vacío
    } finally {
      setLoading(false);
    }
  }, [usuario, API_SALES_URL]);

  // 2. Cargar el historial cuando el componente se monta o el usuario cambia
  useEffect(() => {
    cargarHistorialVentas();
  }, [cargarHistorialVentas]);

  const registrarVenta = async (nuevaVenta) => {
    try {
      // 1. Enviar la venta al backend para persistencia en DB
      const res = await fetch(API_SALES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': usuario?.id || '',
        },
        body: JSON.stringify(nuevaVenta)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al registrar venta en DB');
      }

      const ventaProcesada = await res.json();
      // completo desde la base de datos para evitar duplicados.
      await cargarHistorialVentas();
      return { success: true, venta: ventaProcesada };
    } catch (error) {
      console.error("Error al registrar venta:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <VentasContext.Provider value={{ historialVentas, loading, registrarVenta, recargarVentas: cargarHistorialVentas }}>
      {children}
    </VentasContext.Provider>
  );
};

export const useVentas = () => useContext(VentasContext);
