// ClienteContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ClienteContext = createContext();

export const ClienteProvider = ({ children }) => {
  const [clientes, setClientes] = useState(() => {
    const saved = localStorage.getItem('posfacura_clientes');
    return saved ? JSON.parse(saved) : [
      { id: 1, nombre: "Consumidor Final", rnc: "---", telefono: "---", direccion: "N/A", zona: "N/A", email: "---", categoria: "Bronce" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('posfacura_clientes', JSON.stringify(clientes));
  }, [clientes]);

  const agregarCliente = (nuevo) => setClientes([...clientes, nuevo]);

  const actualizarCliente = (clienteEditado) => {
    setClientes(prev => 
      prev.map(c => c.id === clienteEditado.id ? clienteEditado : c)
    );
  };

  const eliminarCliente = (id) => {
    if (id === 1) return alert("No puedes eliminar al Consumidor Final");
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  return (
    <ClienteContext.Provider value={{ clientes, agregarCliente, actualizarCliente, eliminarCliente }}>
      {children}
    </ClienteContext.Provider>
  );
};

export const useClientes = () => useContext(ClienteContext);