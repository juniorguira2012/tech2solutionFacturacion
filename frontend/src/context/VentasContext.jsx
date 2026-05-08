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

  const registrarVenta = (nuevaVenta) => {
    setHistorialVentas(prev => [
      {
        ...nuevaVenta,
        id: Date.now(),
        // CAMBIO: Guardamos ISO completo para que el Home lo compare matemáticamente
        fecha: new Date().toISOString() 
      }, 
      ...prev
    ]);
  };

  return (
    <VentasContext.Provider value={{ historialVentas, registrarVenta }}>
      {children}
    </VentasContext.Provider>
  );
};

export const useVentas = () => useContext(VentasContext);
