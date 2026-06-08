/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const InventarioContext = createContext();

export const InventarioProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorConexion, setErrorConexion] = useState(null);
  const [conteos, setConteos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const { usuario } = useAuth();
  
  // Si VITE_API_URL no está definido o es absoluto hacia producción, 
  // forzamos el uso de la ruta relativa para que use el subdominio actual.
  const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('inventario.oneredrd.com') ? '/api' : (import.meta.env.VITE_API_URL || '/api');

  const API_URL = `${API_BASE_URL}/products`;

  // --- Estado de Almacenes Detallados ---
  const [almacenesDetallados, setAlmacenesDetallados] = useState([]);

  // --- Estados de configuración (Categorías y Unidades) ---
  const [categorias, setCategorias] = useState(() => {
    try {
      const saved = localStorage.getItem('posfactura_categorias');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(c => typeof c === 'string' ? { nombre: c, color: '#4f46e5' } : c);
      }
    } catch (e) {
      console.error("Error al cargar categorías de localStorage:", e);
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

  const [proveedores, setProveedores] = useState([]);

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

  // Efecto para cargar catálogos (Proveedores y Almacenes)
  useEffect(() => {
    if (!usuario) return;

    const headers = getAuthHeaders();

    // Cargar proveedores
    fetch(`${API_BASE_URL}/providers`, { headers })
      .then(res => res.json().then(data => setProveedores(Array.isArray(data) ? data : [])))
      .catch(err => console.error("Error proveedores:", err));

    // Cargar almacenes directamente desde la DB
    fetch(`${API_BASE_URL}/warehouses`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener almacenes');
        return res.json();
      })
      .then(data => {
        setAlmacenesDetallados(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Error almacenes:", err));
  }, [usuario, refreshIndex, API_BASE_URL]);

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
      const res = await fetch(`${API_BASE_URL}/movements`, { // Corregido para el endpoint de movimientos individuales
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

  // 2.1 Registrar Transferencia entre almacenes
  const registrarTransferencia = async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/movements/transfer`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en la transferencia');

      setRefreshIndex(prev => prev + 1);
      cargarMovimientos();
      return true;
    } catch (err) {
      console.error("Error en registrarTransferencia:", err);
      throw err;
    }
  };

 // --- DENTRO DE InventarioContext.jsx ---

const registrarMovimientosMasivos = async (payload) => {
  try {
    const url = `${API_BASE_URL}/movements/bulk-receive`;
    // 1. Apuntamos a la ruta exacta de tu controlador de NestJS
    const res = await fetch(url, {
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
    const errorMsg = `Error de conexión con la API (${API_BASE_URL}): ${err.message}`;
    console.error(errorMsg, err);
    throw new Error(errorMsg); 
  }
};

  // 2. Agregar Producto
  const agregarProducto = async (nuevoProducto) => {
    try {
      // Limpiamos campos que el DTO de NestJS podría rechazar si no están habilitados
      const { 
        id, 
        createdAt, 
        updatedAt, 
        countItems, 
        vendidos, 
        proveedor, 
        warehouseStocks, 
        proveedorId, 
        ...datosParaEnviar 
      } = nuevoProducto;

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...datosParaEnviar,
          precio: Number(datosParaEnviar.precio) || 0,
          stock: Number(datosParaEnviar.stock) || 0,
          proveedorId: proveedorId ? Number(proveedorId) : null
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

  // --- GESTIÓN DE PROVEEDORES (DB) ---
  const agregarProveedor = async (nuevo) => {
    try {
      const res = await fetch(`${API_BASE_URL}/providers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(nuevo)
      });

      // Validamos si la respuesta es exitosa antes de procesar el JSON
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Error del servidor (${res.status})` }));
        throw new Error(errorData.message || 'Error al crear proveedor');
      }

      const data = await res.json();
      setProveedores(prev => [...prev, data]);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const actualizarProveedor = async (editado) => {
    try {
      const { id, ...datos } = editado;
      const res = await fetch(`${API_BASE_URL}/providers/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(datos)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Error (${res.status})` }));
        throw new Error(errorData.message || 'Error al actualizar proveedor');
      }

      const data = await res.json();
      setProveedores(prev => prev.map(p => p.id === data.id ? data : p));
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const eliminarProveedor = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/providers/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('No se pudo eliminar');
      setProveedores(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error(err);
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
      // Quitamos objetos relacionales y metadatos antes de enviar
      const { 
        id, 
        createdAt, 
        updatedAt, 
        countItems, 
        proveedor, 
        warehouseStocks, 
        proveedorId, 
        ...datosParaEnviar 
      } = editado;

      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...datosParaEnviar,
          precio: Number(editado.precio) || 0,
          stock: Number(editado.stock) || 0,
          proveedorId: proveedorId ? Number(proveedorId) : null
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

  // --- GESTIÓN DE CONTEO FÍSICO (Auditoría) ---
  const cargarConteos = useCallback(async (almacen = '') => {
    try {
      const url = almacen 
        ? `${API_BASE_URL}/inventory-counts?almacen=${almacen}`
        : `${API_BASE_URL}/inventory-counts`;
      
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al cargar conteos');
      const data = await res.json();
      setConteos(data);
    } catch (err) {
      console.error("Error cargando conteos:", err);
    }
  }, [API_BASE_URL]);

  const crearConteo = async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory-counts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('No se pudo crear el conteo');
      const data = await res.json();
      setConteos(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const obtenerConteo = async (id) => {
    const res = await fetch(`${API_BASE_URL}/inventory-counts/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Conteo no encontrado');
    return res.json();
  };

  const agregarItemAConteo = async (conteoId, itemData) => {
    const res = await fetch(`${API_BASE_URL}/inventory-counts/${conteoId}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error('Error al agregar item');
    return res.json();
  };

  const actualizarItemConteo = async (conteoId, itemId, cantidad) => {
    const res = await fetch(`${API_BASE_URL}/inventory-counts/${conteoId}/items/${itemId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cantidadContada: Number(cantidad) })
    });
    if (!res.ok) throw new Error('Error al actualizar cantidad');
    return res.json();
  };

  const publicarConteo = async (id) => {
    const res = await fetch(`${API_BASE_URL}/inventory-counts/${id}/publish`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al publicar ajustes');
    const data = await res.json();
    setConteos(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };

  const eliminarConteo = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory-counts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('No se pudo eliminar el conteo');
      
      setConteos(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error("Error eliminando conteo:", err);
      throw err;
    }
  };

  // --- GESTIÓN DE ALMACENES (DB) ---
  const agregarAlmacen = async (nuevo) => {
    try {
      const res = await fetch(`${API_BASE_URL}/warehouses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(nuevo)
      });
      if (!res.ok) throw new Error('Error al crear almacén');
      const data = await res.json();
      setAlmacenesDetallados(prev => [...prev, data]);
      return true;
    } catch (err) { console.error(err); throw err; }
  };

  const actualizarAlmacen = async (editado) => {
    try {
      const { id, ...datos } = editado;
      const res = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(datos)
      });
      if (!res.ok) throw new Error('Error al actualizar almacén');
      const data = await res.json();
      setAlmacenesDetallados(prev => prev.map(a => a.id === data.id ? data : a));
      return true;
    } catch (err) { console.error(err); throw err; }
  };

  const eliminarAlmacen = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'No se pudo eliminar el almacén');
      }
      setAlmacenesDetallados(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) { console.error(err); throw err; }
  };

  // --- GESTIÓN DE LOTES ---
  const cargarLotes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory-batches`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al cargar lotes');
      const data = await res.json();
      setLotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando lotes:", err);
      // Fallback a datos vacíos si el endpoint aún no existe en el backend
      setLotes([]);
    }
  }, [API_BASE_URL]);

  // --- GESTIÓN DE COMODATO (PRÉSTAMOS) ---
  const cargarPrestamos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/comodatos`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al cargar préstamos');
      const data = await res.json();
      setPrestamos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando comodatos:", err);
      setPrestamos([]);
    }
  }, [API_BASE_URL, usuario]); // Mantener usuario aquí para que el useCallback no cambie innecesariamente

  const crearPrestamo = async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/comodatos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...payload,
          usuarioId: usuario?.id // Vinculamos quién registra el préstamo
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al registrar préstamo');
      }

      const data = await res.json();
      setPrestamos(prev => [data, ...prev]);
      setRefreshIndex(prev => prev + 1); // Refrescamos productos para actualizar stock
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const devolverPrestamo = async (comodatoId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/comodatos/${comodatoId}/devolver`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al devolver préstamo');
      }

      const data = await res.json();
      setPrestamos(prev => prev.map(p => p.id === comodatoId ? data : p));
      setRefreshIndex(prev => prev + 1); // Refrescamos productos para actualizar stock
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    if (usuario) cargarPrestamos();
  }, [usuario, cargarPrestamos, refreshIndex]); // Añadir refreshIndex aquí

  // --- Al final de InventarioContext.jsx ---

return (
  <InventarioContext.Provider value={{ 
    productos, 
    movimientos, 
    loading, 
    errorConexion, 
    categorias, 
    setCategorias,
    proveedores,
    agregarProveedor,
    actualizarProveedor,
    eliminarProveedor,
    setProveedores,
    unidadesMedida, 
    conteos,
    lotes,
    prestamos,
    cargarPrestamos,
    crearPrestamo,
    devolverPrestamo,
    cargarLotes,
    cargarConteos,
    crearConteo,
    obtenerConteo,
    agregarItemAConteo,
    actualizarItemConteo,
    eliminarConteo,
    publicarConteo,
    setUnidadesMedida, 
    almacenesDetallados, // <-- Exponemos los almacenes
    agregarAlmacen,
    actualizarAlmacen,
    eliminarAlmacen,
    setAlmacenesDetallados, // <-- Exponemos el setter para AlmacenSection
    agregarProducto, 
    eliminarProducto,
    actualizarProducto,
    descontarStock,
    registrarMovimiento,         // <-- Asegúrate de que termine en "o" (Minúscula, plural de la función)
    registrarTransferencia,      // <-- Nueva función para transferencias
    registrarMovimientosMasivos, // <-- Tu nueva función masiva
    cargarMovimientos,
    recargarInventario: () => setRefreshIndex(prev => prev + 1)
  }}>
    {children}
  </InventarioContext.Provider>
);
};

export const useInventario = () => useContext(InventarioContext);