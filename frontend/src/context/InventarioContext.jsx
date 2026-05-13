/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InventarioContext = createContext();

export const InventarioProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorConexion, setErrorConexion] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const { usuario } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname || '127.0.0.1'}:3000`;
  const API_URL = `${API_BASE_URL}/products`;

  // --- Estados de configuración (Categorías y Unidades) ---
  const [categorias, setCategorias] = useState(() => {
    const saved = localStorage.getItem('posfactura_categorias');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(c => typeof c === 'string' ? { nombre: c, color: '#4f46e5' } : c);
    }
    return [
      { nombre: 'General', color: '#64748b' },
      { nombre: 'Hardware', color: '#4f46e5' },
      { nombre: 'Software', color: '#8b5cf6' },
      { nombre: 'Electrónica', color: '#ec4899' },
      { nombre: 'Servicios', color: '#0ea5e9' },
      { nombre: 'Alimentos', color: '#10b981' },
      { nombre: 'Bebidas', color: '#f59e0b' },
      { nombre: 'Limpieza', color: '#ef4444' }
    ];
  });

  const [unidadesMedida, setUnidadesMedida] = useState(() => {
    try {
      const saved = localStorage.getItem('posfactura_unidades_medida');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 1, codigo: 'CJ', nombre: 'Caja', activo: true },
      { id: 2, codigo: 'LB', nombre: 'Libra', activo: true },
      { id: 3, codigo: 'UND', nombre: 'Unidad', activo: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem('posfactura_categorias', JSON.stringify(categorias));
  }, [categorias]);

  useEffect(() => {
    localStorage.setItem('posfactura_unidades_medida', JSON.stringify(unidadesMedida));
  }, [unidadesMedida]);

  // --- Helpers ---
  const getInventoryPermission = () => {
    if (usuario?.rol === 'admin') return 'full';
    try {
      const savedRoles = localStorage.getItem('posfactura_roles_config');
      const config = savedRoles ? JSON.parse(savedRoles) : {};
      return config[usuario?.rol]?.modules?.inventario || 'none';
    } catch { return 'none'; }
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-role': usuario?.rol || '',
    'x-inventory-permission': getInventoryPermission(),
  });

  // 1. Cargar productos
  useEffect(() => {
    if (!usuario) return;
    setLoading(true);
    setErrorConexion(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    fetch(API_URL, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProductos(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setErrorConexion(err.name === 'AbortError' ? "Tiempo de espera agotado" : "Error de conexión");
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        setLoading(false);
      });
  }, [usuario, refreshIndex, API_URL]);

  // 2. Agregar Producto
  const agregarProducto = async (nuevoProducto) => {
    try {
      // Ahora que el backend acepta 'imagen' y payloads grandes, la incluimos
      const { id, createdAt, updatedAt, ...datosParaEnviar } = nuevoProducto;

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...datosParaEnviar,
          precio: Number(datosParaEnviar.precio) || 0,
          stock: Number(datosParaEnviar.stock) || 0
        })
      });
      
      const data = await res.json(); // Intentamos obtener la respuesta del servidor incluso si falló

      if (!res.ok) {
        // Imprimimos el error real del backend para saber qué campo falló
        console.error("Error detallado del servidor (400) al crear:", data);
        // Si el backend envía un mensaje (de ValidationPipe), lo usamos
        const mensaje = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(mensaje || 'Error al crear producto');
      }

      setProductos(prev => [...prev, data]);
      return true;
    } catch (err) {
      console.error("Error al agregar producto:", err);
      return false;
    }
  };

  // 3. Eliminar Producto
  const eliminarProducto = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('No se pudo eliminar');
      setProductos(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // 4. Actualizar Producto (CORREGIDO: nombre y limpieza de datos)
  const actualizarProducto = async (editado) => {
    try {
      // IMPORTANTE: Quitamos createdAt, updatedAt y countItems porque NestJS da 500 si se los envías
      // También quitamos vendidos e id del body para evitar conflictos
      const { id, createdAt, updatedAt, countItems, vendidos, ...datosParaEnviar } = editado;

      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...datosParaEnviar,
          precio: Number(editado.precio) || 0,
          stock: Number(editado.stock) || 0
        })
      });

      // Intentamos obtener la respuesta del servidor incluso si falló
      const data = await res.json();

      if (!res.ok) {
        // Imprimimos el error real del backend para saber qué campo falló
        console.error("Error detallado del servidor (400):", data);
        // Si el backend envía un mensaje (de ValidationPipe), lo usamos
        const mensaje = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(mensaje || 'Error en el servidor');
      }
      
      setProductos(prev => prev.map(p => p.id === data.id ? data : p));
      return true;
    } catch (err) {
      console.error("Error al actualizar:", err);
      return false;
    }
  };

  // 5. Descontar Stock
  const descontarStock = async (itemsCarrito) => {
    try {
      const promesas = itemsCarrito.map(item => {
        const prod = productos.find(p => p.id === item.id);
        if (!prod) return null;
        return fetch(`${API_URL}/${item.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            stock: (prod.stock - item.cantidad), 
            vendidos: (prod.vendidos || 0) + item.cantidad 
          })
        }).then(res => res.json());
      }).filter(p => p !== null);

      const resultados = await Promise.all(promesas);
      setProductos(prev => prev.map(p => {
        const actualizado = resultados.find(r => r.id === p.id);
        return actualizado || p;
      }));
    } catch (error) {
      console.error("Error al descontar stock:", error);
    }
  };

  return (
    <InventarioContext.Provider value={{ 
      productos, loading, errorConexion, categorias, setCategorias,
      unidadesMedida, setUnidadesMedida, agregarProducto, eliminarProducto,
      actualizarProducto, // <--- CAMBIADO DE 'ducto' A 'actualizarProducto'
      descontarStock,
      recargarInventario: () => setRefreshIndex(prev => prev + 1)
    }}>
      {children}
    </InventarioContext.Provider>
  );
};

export const useInventario = () => useContext(InventarioContext);