/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InventarioContext = createContext();

export const InventarioProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorConexion, setErrorConexion] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Estados compartidos de configuración
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

  const { usuario } = useAuth();
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    `http://${window.location.hostname || '127.0.0.1'}:3000`;
  const API_URL = `${API_BASE_URL}/products`;

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
    // Si no hay usuario, no intentamos cargar para evitar errores de cabeceras vacías
    if (!usuario) return;

    console.log("Iniciando carga de inventario desde:", API_URL);
    setLoading(true);
    setErrorConexion(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    fetch(API_URL, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`El servidor respondió con error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Productos recibidos con éxito:", data);
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fallo crítico al conectar con el Backend:", err);
        const mensaje =
          err.name === 'AbortError'
            ? `El backend no respondió a tiempo en ${API_URL}.`
            : `No se pudo conectar con el servidor en ${API_URL}.`;
        setErrorConexion(mensaje);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        setLoading(false);
      });
  }, [usuario, refreshIndex]); // Re-ejecutar si el usuario cambia o si se fuerza una recarga

  // 2. Agregar producto al Backend
  const agregarProducto = async (nuevoProducto) => {
  try {
    // ELIMINAMOS el ID para que Postgres asigne el suyo (1, 2, 3...)
    const { id: _id, ...datosParaEnviar } = nuevoProducto; 

    const res = await fetch(API_URL, {
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
    const promesasActualizacion = itemsCarrito.map(item => {
      const productoOriginal = productos.find(p => p.id === item.id);
      if (!productoOriginal) return null;

      const nuevoStock = productoOriginal.stock - item.cantidad;
      const nuevosVendidos = (productoOriginal.vendidos || 0) + item.cantidad;

      return fetch(`${API_URL}/${item.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stock: nuevoStock, vendidos: nuevosVendidos })
      }).then(res => {
        if (!res.ok) throw new Error(`Error al actualizar producto ${item.id}`);
        return res.json();
      });
    }).filter(p => p !== null);

    // Esperamos a que todas las peticiones terminen
    const productosActualizadosServidor = await Promise.all(promesasActualizacion);

    // Actualizamos el estado local basándonos en la respuesta del servidor
    const nuevosProductos = productos.map(p => {
      const actualizado = productosActualizadosServidor.find(upd => upd.id === p.id);
      return actualizado ? actualizado : p;
    });

    // Actualizamos el estado de React UNA SOLA VEZ con todos los cambios
    setProductos(nuevosProductos);

  } catch (error) {
    console.error("Error masivo al descontar stock:", error);
  }
};

  return (
    <InventarioContext.Provider value={{ 
      productos, 
      loading, 
      errorConexion,
      agregarProducto, 
      descontarStock, 
      actualizarProducto, 
      eliminarProducto,
      categorias,
      setCategorias,
      unidadesMedida,
      setUnidadesMedida,
      recargarInventario: () => setRefreshIndex(prev => prev + 1)
    }}>
      {children}
    </InventarioContext.Provider>
  );
};

export const useInventario = () => useContext(InventarioContext);
