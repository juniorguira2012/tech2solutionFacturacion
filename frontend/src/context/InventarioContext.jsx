import React, { createContext, useState, useContext, useEffect } from 'react';

const InventarioContext = createContext();

export const InventarioProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const API_URL = 'http://localhost:3000/products';

  // 1. Cargar productos desde el Backend al iniciar
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  // 2. Agregar producto al Backend
  const agregarProducto = async (nuevoProducto) => {
  try {
    // ELIMINAMOS el ID para que Postgres asigne el suyo (1, 2, 3...)
    const { id, ...datosParaEnviar } = nuevoProducto; 

    const res = await fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  } catch (error) {
    console.error("Error en agregarProducto:", error);
    alert("No se pudo guardar el producto. Revisa la consola del backend.");
  }
};

  // 3. Eliminar del Backend
  const eliminarProducto = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("No se pudo eliminar:", err);
    }
  };

  // 4. Actualizar en el Backend
  const actualizarProducto = async (editado) => {
    try {
      const res = await fetch(`${API_URL}/${editado.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editado)
      });
      const data = await res.json();
      setProductos(prev => prev.map(p => p.id === data.id ? data : p));
    } catch (err) {
      console.error("No se pudo actualizar:", err);
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