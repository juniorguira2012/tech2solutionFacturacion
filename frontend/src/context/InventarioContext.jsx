/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const InventarioContext = createContext();

export const InventarioProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorConexion, setErrorConexion] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const { usuario } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname || '127.0.0.1'}:3000/products`;
  // Forma más segura de obtener la base sin importar si hay "/" al final
  const API_BASE_URL = API_URL.split('/products')[0];

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
    'x-user-id': usuario?.id || '', // Aseguramos que el ID del usuario se envíe
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

    fetch(API_URL, { signal: controller.signal, headers: getAuthHeaders() })
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

  // 1.1 Cargar Movimientos (Kardex)
  const cargarMovimientos = useCallback(async (productoId = null) => {
    try {
      const url = productoId 
        ? `${API_BASE_URL}/movements?productoId=${productoId}`
        : `${API_BASE_URL}/movements`;
      
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al cargar movimientos');
      const data = await res.json();
      setMovimientos(data);
    } catch (err) {
      console.error("Error Kardex:", err);
    }
  }, [API_BASE_URL]);

  // 2. Registrar Movimiento (Sustituye actualizarProducto en la sección de movimientos)
  const registrarMovimiento = async (datosMovimiento) => {
    try {
      const res = await fetch(`${API_BASE_URL}/movements/bulk-receive`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(datosMovimiento)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en el movimiento');

      // Refrescamos productos para ver el nuevo stock y el historial
      setRefreshIndex(prev => prev + 1);
      setMovimientos(prev => [data, ...prev]);
      return true;
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      throw err; // Re-lanzamos para que la UI pueda capturar el error
    }
  };

 // --- DENTRO DE InventarioContext.jsx ---

const registrarMovimientosMasivos = async (payload) => {
  try {
    // 1. Apuntamos a la ruta exacta de tu controlador de NestJS
    const res = await fetch(`${API_BASE_URL}/movements/bulk-receive`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = 'Error en el procesamiento masivo';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = Array.isArray(errorJson.message) ? errorJson.message.join(', ') : errorJson.message;
      } catch {
        errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();

    // 2. Refrescamos la UI
    setRefreshIndex(prev => prev + 1);
    cargarMovimientos(); 
    
    return true;
  } catch (err) {
    console.error("Error en registrarMovimientosMasivos:", err);
    throw err; 
  }
};

  // 2. Agregar Producto
  const agregarProducto = async (nuevoProducto) => {
    try {
      // Limpiamos campos que el DTO de NestJS podría rechazar si no están habilitados
      const { id, createdAt, updatedAt, countItems, vendidos, ...datosParaEnviar } = nuevoProducto;

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
      throw err; // Re-lanzamos para que ProductosSection lo atrape
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
      // También quitamos id y ubicacion del body para evitar conflictos con el DTO
      const { id, createdAt, updatedAt, countItems, ...datosParaEnviar } = editado;

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
      throw err; // Re-lanzamos el error
    }
  };

  // 5. Descontar Stock
  const descontarStock = async (itemsCarrito) => {
    try {
      // Creamos headers especiales para despacho que aseguren que el backend
      // entienda que es una operación de venta y no una gestión manual.
      const headers = getAuthHeaders();
      if (headers['x-inventory-permission'] === 'none') {
        headers['x-inventory-permission'] = 'view'; // Mínimo permiso para despachar
      }

      const promesas = itemsCarrito.map(async (item) => {
        const res = await fetch(`${API_BASE_URL}/movements`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ 
            productoId: Number(item.id), // Aseguramos que sea número para la DB
            tipo: 'DESPACHAR',
            cantidad: Number(item.cantidad),
            nota: 'Venta realizada desde el POS'
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Error al descontar stock de ${item.nombre}`);
        }
        return res.json();
      });

      const resultados = await Promise.all(promesas);
      setRefreshIndex(prev => prev + 1); // Recargamos para ver stock y Kardex actualizado
    } catch (error) {
      console.error("Error al descontar stock:", error);
      throw error; // Re-lanzamos el error para que Ventas.jsx lo capture
    }
  };

  // --- Al final de InventarioContext.jsx ---

return (
  <InventarioContext.Provider value={{ 
    productos, 
    movimientos, 
    loading, 
    errorConexion, 
    categorias, 
    setCategorias,
    unidadesMedida, 
    setUnidadesMedida, 
    agregarProducto, 
    eliminarProducto,
    actualizarProducto,
    descontarStock,
    registrarMovimiento,         // <-- Asegúrate de que termine en "o" (Minúscula, plural de la función)
    registrarMovimientosMasivos, // <-- Tu nueva función masiva
    cargarMovimientos,
    recargarInventario: () => setRefreshIndex(prev => prev + 1)
  }}>
    {children}
  </InventarioContext.Provider>
);
};

export const useInventario = () => useContext(InventarioContext);