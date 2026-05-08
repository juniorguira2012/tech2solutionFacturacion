/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InventarioContext = createContext();

export const InventarioProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const { usuario } = useAuth();
  const API_URL = 'http://localhost:3000/products';

  const getInventoryPermission = () => {
    if (usuario?.rol === 'admin') return 'full';

    try {
      const savedRoles = localStorage.getItem('posfactura_roles_config');
      const config = savedRoles ? JSON.parse(savedRoles) : {};
      return config[usuario?.rol]?.modules?.inventario || 'none';
    } catch {
      return 'none';
    }
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-role': usuario?.rol || '',
    'x-inventory-permission': getInventoryPermission(),
  });

  // 1. Cargar productos desde el Backend al iniciar
  useEffect(() => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el inventario');
        return res.json();
      })
      .then(data => setProductos(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  // 2. Agregar producto al Backend
  const agregarProducto = async (nuevoProducto) => {
  try {
    // ELIMINAMOS el ID para que Postgres asigne el suyo (1, 2, 3...)
    const { id: _id, ...datosParaEnviar } = nuevoProducto; 

    const res = await fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...datosParaEnviar,
        precio: Number(datosParaEnviar.precio), // Forzamos que sea número
        stock: Number(datosParaEnviar.stock)    // Forzamos que sea número
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error del servidor:", errorData);
      throw new Error('Error al guardar en la base de datos');
    }

    const productoGuardado = await res.json();
    setProductos(prev => [...prev, productoGuardado]);
    return true;
  } catch (error) {
    console.error("Error en agregarProducto:", error);
    alert("No se pudo guardar el producto. Revisa la consola del backend.");
    return false;
  }
};

  // 3. Eliminar del Backend
  const eliminarProducto = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('No se pudo eliminar el producto');
      setProductos(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error("No se pudo eliminar:", err);
      alert("No se pudo eliminar el producto.");
      return false;
    }
  };

  // 4. Actualizar en el Backend
  const actualizarProducto = async (editado) => {
    try {
      const res = await fetch(`${API_URL}/${editado.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(editado)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Error del servidor:", errorData);
        throw new Error('No se pudo actualizar el producto');
      }
      const data = await res.json();
      setProductos(prev => prev.map(p => p.id === data.id ? data : p));
      return true;
    } catch (err) {
      console.error("No se pudo actualizar:", err);
      alert("No se pudo actualizar el producto.");
      return false;
    }
  };

 // 5. Descontar Stock (Ventas) 
const descontarStock = async (itemsCarrito) => {
  try {
    // Usamos un for...of para manejar las peticiones asíncronas una por una
    for (const item of itemsCarrito) {
      // 1. Buscamos el producto actual en nuestro estado local
      const prod = productos.find(p => p.id === item.id);
      
      if (prod) {
        // 2. Calculamos los nuevos valores
        const nuevoStock = prod.stock - item.cantidad;
        const nuevosVendidos = (prod.vendidos || 0) + item.cantidad;

        // 3. Enviamos SOLO los datos necesarios al backend
        // IMPORTANTE: Asegúrate de que item.id sea el número pequeño de la DB
        await actualizarProducto({
          id: prod.id,
          stock: nuevoStock,
          vendidos: nuevosVendidos
        });
      }
    }
    
    // Opcional: Recargar productos desde el servidor para estar 100% sincronizados
    const res = await fetch(API_URL);
    const data = await res.json();
    setProductos(data);

  } catch (error) {
    console.error("Error masivo al descontar stock:", error);
  }
};

  return (
    <InventarioContext.Provider value={{ productos, agregarProducto, descontarStock, actualizarProducto, eliminarProducto }}>
      {children}
    </InventarioContext.Provider>
  );
};

export const useInventario = () => useContext(InventarioContext);
