/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const VentasContext = createContext();
// El VentasProvider se encarga de manejar el historial de ventas y registrar nuevas ventas.
export const VentasProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [historialVentas, setHistorialVentas] = useState(() => {
    try {
        const saved = localStorage.getItem('posfacura_ventas');
        return (saved && saved !== "undefined") ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
  });

  const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname || '127.0.0.1'}:3000/products`;
  const API_SALES_URL = API_URL.split('/products')[0] + '/sales';

  useEffect(() => {
    localStorage.setItem('posfacura_ventas', JSON.stringify(historialVentas));
  }, [historialVentas]);

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

      setHistorialVentas(prev => [ventaProcesada, ...prev]);
      return { success: true, venta: ventaProcesada };
    } catch (error) {
      console.error("Error al registrar venta:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <VentasContext.Provider value={{ historialVentas, registrarVenta }}>
      {children}
    </VentasContext.Provider>
  );
};

export const useVentas = () => useContext(VentasContext);
