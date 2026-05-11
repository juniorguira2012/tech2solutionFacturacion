/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';

const VentasContext = createContext();
// El VentasProvider se encarga de manejar el historial de ventas y registrar nuevas ventas.
export const VentasProvider = ({ children }) => {
  const [historialVentas, setHistorialVentas] = useState(() => {
    try {
        const saved = localStorage.getItem('posfacura_ventas');
        return (saved && saved !== "undefined") ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('posfacura_ventas', JSON.stringify(historialVentas));
  }, [historialVentas]);

  const registrarVenta = async (nuevaVenta) => {
    try {
      const ventaProcesada = {
        ...nuevaVenta,
        id: `V-${Date.now()}`,
        fecha: new Date().toISOString()
      };

      // Por ahora simulamos una espera de red
      await new Promise(resolve => setTimeout(resolve, 400));

      setHistorialVentas(prev => [ventaProcesada, ...prev]);
      return { success: true, venta: ventaProcesada };
    } catch (error) {
      console.error("Error al registrar venta:", error);
      return { success: false, error };
    }
  };

  return (
    <VentasContext.Provider value={{ historialVentas, registrarVenta }}>
      {children}
    </VentasContext.Provider>
  );
};

export const useVentas = () => useContext(VentasContext);
