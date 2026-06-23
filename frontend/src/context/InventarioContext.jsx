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
  const [tecnicos, setTecnicos] = useState([]);
  const [seriales, setSeriales] = useState([]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [verEliminados, setVerEliminados] = useState(false);

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

  const [unidadesMedida, setUnidadesMedida] = useState([]);

  useEffect(() => {
    localStorage.setItem('posfactura_categorias', JSON.stringify(categorias));
  }, [categorias]);

  // --- Helpers ---
  const getInventoryPermission = useCallback(() => {
    if (usuario?.rol === 'admin') return 'full';
    try {
      const savedRoles = localStorage.getItem('posfactura_roles_config');
      const config = savedRoles ? JSON.parse(savedRoles) : {};
      return config[usuario?.rol]?.modules?.inventario || 'none';
    } catch { return 'none'; }
  }, [usuario?.rol]);

  const getAuthHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-user-id': usuario?.id || '', // Aseguramos que el ID del usuario se envíe
    'x-user-role': usuario?.rol || '',
    'x-inventory-permission': getInventoryPermission(),
  }), [usuario?.id, usuario?.rol, getInventoryPermission]);

  // 1. Cargar productos
  useEffect(() => {
    if (!usuario) return;
    setLoading(true);
    setErrorConexion(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    // Agregamos el query parameter isActive según el estado verEliminados
    const urlConFiltro = verEliminados === 'all'
      ? `${API_URL}?isActive=all`
      : `${API_URL}?isActive=${verEliminados ? 'false' : 'true'}`;

    console.log("InventarioContext: Intentando cargar productos desde:", urlConFiltro);

    fetch(urlConFiltro, { signal: controller.signal, headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("InventarioContext: Productos recibidos con éxito:", data);
        setProductos(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("InventarioContext: Error al cargar productos:", err);
        setErrorConexion(err.name === 'AbortError' ? "Tiempo de espera agotado" : `Error de conexión: ${err.message}`);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        setLoading(false);
      });
  }, [usuario, refreshIndex, API_URL, verEliminados, getAuthHeaders]);

  // Efecto para cargar catálogos globales (Proveedores, Almacenes y Unidades)
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

    // Cargar unidades de medida directamente desde la DB para que estén disponibles globalmente
    fetch(`${API_BASE_URL}/units-of-measure`, { headers })
      .then(res => {
        if (!res.ok) {
          console.error(`Status: ${res.status} al cargar catálogos de unidades`);
          throw new Error(`Error al obtener unidades (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        setUnidadesMedida(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Error unidades:", err));

    fetch(`${API_BASE_URL}/movements/technicians`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener técnicos');
        return res.json();
      })
      .then(data => {
        setTecnicos(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Error técnicos:", err));
  }, [usuario, refreshIndex, API_BASE_URL, getAuthHeaders]);

  // --- GESTIÓN DE UNIDADES DE MEDIDA (DB) ---
  const cargarUnidadesMedida = useCallback(async () => {
    if (!usuario) return;
    try {
      const res = await fetch(`${API_BASE_URL}/units-of-measure`, { headers: getAuthHeaders() });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || `Status: ${res.status}`;
        throw new Error(`Error al cargar unidades: ${msg}`);
      }
      const data = await res.json();
      setUnidadesMedida(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("🔴 Error detallado en cargarUnidadesMedida:", err.message);
    }
  }, [API_BASE_URL, getAuthHeaders, usuario]);

  const agregarUnidadMedida = async (nueva) => {
    try {
      const res = await fetch(`${API_BASE_URL}/units-of-measure`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          codigo: nueva.codigo,
          nombre: nueva.nombre,
          activo: nueva.activo ?? true
        })
      });

      // 🚨 ¡AQUÍ ESTÁ EL TRUCO! Si NestJS responde con error (400, 404, 500), lo capturamos correctamente
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ Error detallado desde NestJS:", errorData);
        
        // Si el ValidationPipe de NestJS devuelve un array de mensajes, los unimos
        const mensajeObj = Array.isArray(errorData.message) 
          ? errorData.message.join(', ') 
          : errorData.message;
          
        throw new Error(mensajeObj || `Error del servidor (${res.status})`);
      }

        const data = await res.json();
        
        // Sincronizamos el estado local agregando el objeto real con el ID que generó Postgres
        setUnidadesMedida(prev => [data, ...prev]); 
        return true;
      } catch (err) {
        console.error("🔴 Error en agregarUnidadMedida [Context]:", err.message);
        throw err; // Re-lanzamos el error real para que UnidadesSection lo atrape en su catch
      }
    };

  const actualizarUnidadMedida = async (id, editada) => {
    try {
      const res = await fetch(`${API_BASE_URL}/units-of-measure/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(editada)
      });
      if (!res.ok) throw new Error('Error al actualizar unidad');
      const data = await res.json();
      setUnidadesMedida(prev => prev.map(u => u.id === id ? data : u));
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

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

  // Cargar Seriales
  const cargarSeriales = useCallback(async () => {
    if (!usuario) return;
    try {
      const res = await fetch(`${API_BASE_URL}/product-serials`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al cargar los seriales de productos');
      const data = await res.json();
      setSeriales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando seriales:", err);
      setSeriales([]); // Aseguramos que sea un array vacío en caso de error
    }
  }, [API_BASE_URL, getAuthHeaders, usuario]);

  const actualizarEstadoSerial = async (serialId, nuevoEstado) => {
    try {
      const res = await fetch(`${API_BASE_URL}/product-serials/${serialId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nuevoEstado }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el estado del serial');
      }

      const serialActualizado = await res.json();

      setSeriales(prev => prev.map(s => (s.id === serialId ? serialActualizado : s)));
      return true;
    } catch (err) {
      console.error('Error en actualizarEstadoSerial:', err);
      throw err;
    }
  };

  const actualizarSerial = async (id, nuevoNumero) => {
    try {
      const res = await fetch(`${API_BASE_URL}/product-serials/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ serialNumber: nuevoNumero }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar el serial');
      }

      // Actualizamos el estado global de productos para reflejar el cambio
      setRefreshIndex(prev => prev + 1);

      return data; // Devolvemos el serial actualizado
    } catch (err) {
      console.error('Error en actualizarSerial:', err);
      throw err;
    }
  };

  const obtenerHistorialSerial = async (serialNumber) => {
    try {
      const res = await fetch(`${API_BASE_URL}/movements/by-serial/${serialNumber}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Error al obtener el historial del serial');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error en obtenerHistorialSerial:', err);
      throw err;
    }
  };

  const asignarSerialesTecnico = async (datosFormulario) => {
  try {
    const baseApi = import.meta.env.VITE_API_URL;
    const URL_COMPLETA = `${baseApi}/movements/assign-to-technician`;

    // 🛠️ FORMATEAR Y LIMPIAR EL PAYLOAD SEGÚN LAS REGLAS DE NESTJS
    const payload = {
      // 1. Asegurar que el ID del técnico sea un número entero
      technicianId: Number(datosFormulario.technicianId),
      
      // 2. Convertir los seriales en un arreglo de strings limpios, quitando vacíos
      serials: Array.isArray(datosFormulario.serials)
        ? datosFormulario.serials.map(s => String(s).trim()).filter(Boolean)
        : [],
        
      // 3. Asegurar que usuarioId sea un número entero y no vaya vacío
      usuarioId: datosFormulario.usuarioId ? Number(datosFormulario.usuarioId) : null
    };

    // Validaciones preventivas en el Frontend
    if (!payload.technicianId || isNaN(payload.technicianId)) {
      throw new Error('Debe seleccionar un técnico válido.');
    }
    if (payload.serials.length === 0) {
      throw new Error('Debe ingresar al menos un número de serie válido.');
    }
    if (!payload.usuarioId || isNaN(payload.usuarioId)) {
      throw new Error('El ID de usuario es obligatorio y debe ser un número.');
    }

    console.log("Enviando Payload correcto a NestJS:", payload);

    const res = await fetch(URL_COMPLETA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Crucial para que NestJS procese el JSON
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      // Si NestJS devuelve un error de validación, lo capturamos aquí
      throw new Error(data.message || 'Error en la asignación');
    }

      return data;
    } catch (error) {
      console.error("Error en asignarSerialesTecnico:", error.message);
      throw error;
    }
  };
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

  const crearTecnico = async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/movements/technicians`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear técnico');

      setTecnicos(prev => {
        const existe = prev.some(t => Number(t.id) === Number(data.id));
        return existe ? prev.map(t => Number(t.id) === Number(data.id) ? data : t) : [...prev, data];
      });
      return data;
    } catch (err) {
      console.error("Error al crear técnico:", err);
      throw err;
    }
  };

  const actualizarTecnico = async (id, payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/movements/technicians/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar técnico');

      setTecnicos(prev => prev.map(t => Number(t.id) === Number(id) ? data : t));
      return data;
    } catch (err) {
      console.error("Error al actualizar técnico:", err);
      throw err;
    }
  };

  const eliminarTecnico = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/movements/technicians/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar técnico');

      setTecnicos(prev => prev.filter(t => Number(t.id) !== Number(id)));
      return data;
    } catch (err) {
      console.error("Error al eliminar técnico:", err);
      throw err;
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
    
    return data;
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
        serialsInput, // Campo extra que debemos quitar
        ...datosParaEnviar 
      } = nuevoProducto;

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...datosParaEnviar,
          precio: Number(datosParaEnviar.precio) || 0,
          stock: Number(datosParaEnviar.stock) || 0,
          proveedorId: proveedorId ? Number(proveedorId) : null,
          // El campo 'serials' ya está dentro de 'datosParaEnviar' si es necesario
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
      setRefreshIndex(prev => prev + 1); // Dispara la recarga global de catálogos y productos
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

  const eliminarCliente = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'El servidor rechazó la eliminación del cliente');
      }
      // Actualizar estado local si es necesario
      return true;
    } catch (err) {
      throw err;
    }
  };

  // 3. Eliminar Producto
  const eliminarProducto = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      // Si el backend responde con error (como el 500 de la FK), entramos aquí
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Atrapamos el mensaje real del backend (NestJS suele mandarlo en errorData.message)
        const msg = Array.isArray(errorData.message) ? errorData.message[0] : errorData.message;
        throw new Error(msg || 'Error de integridad en el servidor.');
      }

      // SI TODO SALIÓ BIEN (Status 200), lo removemos de la vista de inmediato
      setProductos(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error("Error al intentar eliminar producto:", err.message);
      throw err; // Se relanza para que el modal o componente de la UI muestre el alert con el error
    }
  };

  // Restaurar Producto
  const restaurarProducto = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/restore`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errorData.message) ? errorData.message[0] : errorData.message;
        throw new Error(msg || 'Error al intentar restaurar el producto.');
      }

      // Lo quitamos de la lista actual (que es la de eliminados)
      setProductos(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error("Error al restaurar producto:", err.message);
      throw err;
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
      setRefreshIndex(prev => prev + 1); // Dispara la recarga global de catálogos y productos
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
      // Esto inserta el nuevo préstamo al inicio del array (arriba)
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
    tecnicos,
    prestamos,
    seriales,
    cargarSeriales,
    obtenerHistorialSerial,
    actualizarEstadoSerial,
    movimientos, 
    asignarSerialesTecnico,
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
    cargarPrestamos,
    crearPrestamo,
    devolverPrestamo,
    cargarLotes,
    cargarUnidadesMedida,
    agregarUnidadMedida,
    actualizarUnidadMedida,
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
    verEliminados,
    setVerEliminados,
    eliminarProducto,
    restaurarProducto,           // <-- Exponemos la nueva función
    actualizarProducto,
    actualizarSerial, // <-- Exponemos la nueva función
    descontarStock,
    registrarMovimiento,         
    crearTecnico,
    actualizarTecnico,
    eliminarTecnico,
    registrarTransferencia,      
    registrarMovimientosMasivos,
    cargarMovimientos,
    cargarConteos,
    recargarInventario: () => setRefreshIndex(prev => prev + 1)
  }}>
    {children}
  </InventarioContext.Provider>
);
};

export const useInventario = () => useContext(InventarioContext);
