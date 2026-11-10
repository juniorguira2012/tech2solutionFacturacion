import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import axiosClient from '../api/axiosClient';

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
  const movimientosCargandoRef = useRef(false);
  const movimientosUltimaCargaRef = useRef(0);

  const {usuario, permisos} = useAuth();

  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  
  // Si VITE_API_URL no está definido o es absoluto hacia producción, 
  // forzamos el uso de la ruta relativa para que use el subdominio actual.
  const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('ventas.muebleshabitat.com') ? '/api' : (import.meta.env.VITE_API_URL || '/api');

  const API_URL = `${API_BASE_URL}/products`;

  // --- Estado de Almacenes Detallados ---
  const [almacenesDetallados, setAlmacenesDetallados] = useState([]);

  // --- Estados de configuración (Categorías y Unidades) ---
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [unidadesMedida, setUnidadesMedida] = useState([]);

  const [terminosBusqueda, setTerminosBusqueda] = useState('');

  // --- Estados de paginación para Movimientos ---
  const [paginaMovimientos, setPaginaMovimientos] = useState(1);
  const [totalPaginasMovimientos, setTotalPaginasMovimientos] = useState(1);
  const [totalRegistrosMovimientos, setTotalRegistrosMovimientos] = useState(0);

 

  const getInventoryPermission = useCallback(() => {
    if (usuario?.rol === 'admin') return 'full';
    
    try {
      // Leemos la configuración que AuthContext ahora mantiene actualizada.
      const savedRoles = localStorage.getItem('posfactura_roles_config');
      const rolesConfig = savedRoles ? JSON.parse(savedRoles) : {};
      
      // Extraemos los permisos específicos para el rol del usuario y el módulo de inventario.
      const inventarioPerms = rolesConfig[usuario?.rol]?.modules?.inventario;
      
      if (!inventarioPerms) return 'none';
      
      // Devolvemos el permiso más alto disponible para el header HTTP.
      if (inventarioPerms.edit) return 'edit';
      if (inventarioPerms.view) return 'view';
      
      return 'none';
    } catch (error) {
      console.error("Error al obtener permisos de inventario:", error);
      return 'none'; 
    }
  }, [usuario?.rol]);

 const getWarehousePermission = useCallback((action) => {
  if (usuario?.rol === 'admin') return 'full';

  try {
    const savedRoles = localStorage.getItem('posfactura_roles_config');
    const rolesConfig = savedRoles ? JSON.parse(savedRoles) : {};
    const inventarioPerms = rolesConfig[usuario?.rol]?.modules?.inventario;
    const almacenPerms = inventarioPerms?.subModulos?.almacen ?? inventarioPerms;

    return almacenPerms?.[action] ? action : 'none';
  } catch (error) {
    console.error('Error al obtener permisos de almacén:', error);
    return 'none';
  }
 }, [usuario?.rol]);

 const getAuthHeaders = useCallback(() => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('posfactura_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  if (usuario?.id) {
    headers['x-user-id'] = usuario.id;
    headers['x-user-role'] = usuario.rol;
    headers['x-inventory-permission'] = getInventoryPermission();
  }
  
  return headers;
}, [usuario?.id, usuario?.rol, getInventoryPermission]); // Solo depende de los estados reales de sesión
const [terminoBusqueda, setTerminoBusqueda] = useState('');

const cargarProductosPrioritarios = async (page = 1, query = terminoBusqueda) => {
    setLoading(true);
    setErrorConexion(null);
    try {
      const estadoFiltro = verEliminados === 'all' ? 'all' : verEliminados ? 'false' : 'true';
      
      const res = await axiosClient.get('/products', {
        params: {
          page: page,
          limit: 20,
          isActive: estadoFiltro,
          // 💡 Nos aseguramos de enviar siempre el query de búsqueda al backend
          ...(query && query.trim() !== '' ? { search: query.trim() } : {})
        },
        headers: {
          'x-inventory-permission': 'true',
        }
      });
      
      const responseData = res.data;
      const listaProductos = responseData.data || (Array.isArray(responseData) ? responseData : []);
      const meta = responseData.meta || {};

      setProductos(listaProductos);
      setPaginaActual(Number(meta.page || page));
      setTotalPaginas(Number(meta.lastPage || 1));
      setTotalRegistros(Number(meta.total || listaProductos.length));
      
    } catch (error) {
      console.error("Error al buscar productos:", error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

// EL USEEFFECT CORREGIDO Y LIMPIO
  useEffect(() => {
    if (!usuario?.id) return;

    // Ya no necesitamos validar cabeceras a mano si axiosClient ya las inyecta por el interceptor, 
    // pero si deseas mantener la validación del token:
    const token = localStorage.getItem('posfactura_token');
    if (!token) return;

    const cargarDatosSecundarios = async () => {
      // 💡 Usamos rutas relativas limpias, ya que axiosClient maneja la base URL
      const recursos = [
        { endpoint: '/providers', setter: setProveedores },
        { endpoint: '/warehouses', setter: setAlmacenesDetallados },
        { endpoint: '/units-of-measure', setter: setUnidadesMedida },
        { endpoint: '/movements/technicians', setter: setTecnicos },
        { endpoint: '/categories', setter: setCategorias },
        { endpoint: '/movements', setter: setMovimientos },
      ];

      const promesas = recursos.map((r) =>
        axiosClient.get(r.endpoint, {
          headers: {
            'x-user-id': usuario?.id || '',
            'x-inventory-permission': 'true',
          }
        }).then((res) => {
          // 💡 Con Axios, la respuesta exitosa viene directamente en res.data
          return res.data;
        })
      );

      const resultados = await Promise.allSettled(promesas);

      resultados.forEach((resultado, index) => {
        if (resultado.status === 'fulfilled') {
          const datos = Array.isArray(resultado.value)
            ? resultado.value
            : resultado.value?.data;
          recursos[index].setter(Array.isArray(datos) ? datos : []);
        } else {
          console.warn(`Advertencia al cargar ${recursos[index].endpoint}:`, resultado.reason?.message);
        }
      });
    };

    // Ejecutamos ambas cargas
    cargarProductosPrioritarios(1);
    cargarDatosSecundarios();

  }, [usuario?.id, refreshIndex, verEliminados]);

 // --- GESTIÓN DE UNIDADES DE MEDIDA (DB) ---
  const cargarUnidadesMedida = useCallback(async () => {
    if (!usuario) return;
    try {
      const res = await axiosClient.get('/units-of-measure');
      const data = res.data;
      setUnidadesMedida(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error("🔴 Error detallado en cargarUnidadesMedida:", msg);
      setUnidadesMedida([]);
    }
  }, [usuario]);

  const agregarUnidadMedida = async (nueva) => {
    try {
      const res = await axiosClient.post('/units-of-measure', {
        codigo: nueva.codigo,
        nombre: nueva.nombre,
        activo: nueva.activo ?? true
      });

      const data = res.data;
      // Sincronizamos el estado local agregando el objeto real con el ID que generó Postgres
      setUnidadesMedida(prev => [data, ...prev]); 
      return true;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const mensajeObj = Array.isArray(errorMessage) 
        ? errorMessage.join(', ') 
        : errorMessage;
      
      console.error("🔴 Error en agregarUnidadMedida [Context]:", mensajeObj);
      throw new Error(mensajeObj || 'Error al crear la unidad de medida');
    }
  };

  const actualizarUnidadMedida = async (id, editada) => {
    try {
      const res = await axiosClient.patch(`/units-of-measure/${id}`, editada);
      const data = res.data;
      setUnidadesMedida(prev => prev.map(u => u.id === id ? data : u));
      return true;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const mensajeObj = Array.isArray(errorMessage) 
        ? errorMessage.join(', ') 
        : errorMessage;

      console.error("🔴 Error en actualizarUnidadMedida:", mensajeObj);
      throw new Error(mensajeObj || 'Error al actualizar unidad');
    }
  };
  
const cargarMovimientos = useCallback(async (page = 1, tipo = 'todos', fechaInicio = '', fechaFin = '', productoId = null) => {
    if (!usuario) return;

    try {
      // 1. Construimos los parámetros limpios para Axios
      const params = {
        page,
        limit: 20,
      };
      
      if (productoId) params.productoId = productoId;
      if (tipo && tipo !== 'todos') params.tipo = tipo;
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;
      if (usuario.rol?.toLowerCase() !== 'admin') params.usuarioId = usuario.id;

      // 2. Usamos axiosClient para heredar automáticamente el token y las cabeceras del tenant
      const res = await axiosClient.get('/movements', { params });
      
      // 3. En Axios los datos vienen directamente en res.data
      const responseData = res.data;
      const lista = Array.isArray(responseData) ? responseData : (responseData?.data || []);
      const meta = responseData.meta || { total: lista.length, page: 1, lastPage: 1 };

      if (!productoId) {
        setMovimientos(lista);
        setPaginaMovimientos(Number(meta.page || page)); 
        setTotalPaginasMovimientos(Number(meta.lastPage || 1));
        setTotalRegistrosMovimientos(Number(meta.total || lista.length));
      }
      
      return lista;
    } catch (err) {
      console.error("Error al cargar movimientos:", err.response?.data || err.message);
    }
  }, [usuario, setMovimientos, setPaginaMovimientos, setTotalPaginasMovimientos, setTotalRegistrosMovimientos]);

 // Funciones de control auto-gestionadas (Ya no necesitan recibir parámetros de página)
 const handlePaginaSiguienteMovimientos = (tipo, inicio, fin) => {
    // Calculamos explícitamente la página siguiente sumando 1 al estado actual
    const nuevaPagina = paginaMovimientos + 1;
    
    if (nuevaPagina > totalPaginasMovimientos) return; // Si nos pasamos del límite, no hacemos nada
    
    //console.log("Avanzando a página solicitada:", nuevaPagina);
    setPaginaMovimientos(nuevaPagina);
    cargarMovimientos(nuevaPagina, tipo, inicio, fin);
  };

  const handlePaginaAnteriorMovimientos = (tipo, inicio, fin) => {
    const nuevaPagina = paginaMovimientos - 1;
    
    if (nuevaPagina < 1) return; // Si bajamos de 1, no hacemos nada
    
    console.log("Retrocediendo a página solicitada:", nuevaPagina);
    setPaginaMovimientos(nuevaPagina);
    cargarMovimientos(nuevaPagina, tipo, inicio, fin);
  };
  // Cargar Seriales
  const cargarSeriales = useCallback(async () => {
    if (!usuario) return;
    try {
      const res = await axiosClient.get('/product-serials');
      const data = res.data;
      const listaSeriales = Array.isArray(data) ? data : data?.data;
      setSeriales(Array.isArray(listaSeriales) ? listaSeriales : []);
    } catch (err) {
      console.error("Error cargando seriales:", err.response?.data?.message || err.message);
      setSeriales([]);
    }
  }, [usuario]);

  const actualizarEstadoSerial = async (serialId, nuevoEstado) => {
    try {
      const res = await axiosClient.patch(`/product-serials/${serialId}/status`, { status: nuevoEstado });
      const serialActualizado = res.data;

      setSeriales(prev => prev.map(s => (s.id === serialId ? serialActualizado : s)));
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error('Error en actualizarEstadoSerial:', msg);
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const actualizarSerial = async (id, nuevoNumero) => {
    try {
      const res = await axiosClient.patch(`/product-serials/${id}`, { serialNumber: nuevoNumero });
      const data = res.data;

      setRefreshIndex(prev => prev + 1);
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      console.error('Error en actualizarSerial:', message);
      throw new Error(message || 'Error al actualizar el serial');
    }
  };

  const eliminarSerial = async (id) => {
    try {
      const res = await axiosClient.delete(`/product-serials/${id}`);
      const data = res.data;

      setSeriales(prev => prev.filter(serial => serial.id !== id));
      setRefreshIndex(prev => prev + 1);
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      throw new Error(message || 'Error al eliminar el serial');
    }
  };

  const obtenerHistorialSerial = async (serialNumber) => {
    try {
      const res = await axiosClient.get(`/movements/by-serial/${serialNumber}`);
      const data = res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error en obtenerHistorialSerial:', err);
      throw err;
    }
  };

  const asignarSerialesTecnico = async (datosFormulario) => {
    try {
      const payload = {
        technicianId: Number(datosFormulario.technicianId),
        serials: Array.isArray(datosFormulario.serials)
          ? datosFormulario.serials.map(s => String(s).trim()).filter(Boolean)
          : [],
        usuarioId: datosFormulario.usuarioId ? Number(datosFormulario.usuarioId) : null
      };

      if (!payload.technicianId || isNaN(payload.technicianId)) {
        throw new Error('Debe seleccionar un técnico válido.');
      }
      if (payload.serials.length === 0) {
        throw new Error('Debe ingresar al menos un número de serie válido.');
      }
      if (!payload.usuarioId || isNaN(payload.usuarioId)) {
        throw new Error('El ID de usuario es obligatorio y debe ser un número.');
      }

      const res = await axiosClient.post('/movements/assign-to-technician', payload);
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.error("Error en asignarSerialesTecnico:", msg);
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const devolverSerialTecnico = async (serialNumber, nota, user) => {
    try {
      if (!user || !user.id) {
        throw new Error('No se ha detectado una sesión activa. Por favor, vuelve a iniciar sesión.');
      }

      const res = await axiosClient.post('/movements/return-from-technician', {
        serialNumber,
        nota,
        usuarioId: Number(user.id)
      });

      if (typeof setRefreshIndex === 'function') {
        setRefreshIndex(prev => prev + 1);
      }
      
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };
 
  const registrarMovimiento = async (datosMovimiento) => {
    try {
      // axiosClient agrega el token y el subdominio actual del tenant.
      const res = await axiosClient.post('/movements', datosMovimiento);
      const data = res.data;

      setRefreshIndex(prev => prev + 1);
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al registrar movimiento:", message);
      throw new Error(message || 'Error al registrar movimiento');
    }
  };

  const crearTecnico = async (nuevoTecnico) => {
    try {
      // axiosClient agrega el token y el subdominio actual del tenant.
      const res = await axiosClient.post('/movements/technicians', nuevoTecnico);

      const data = res.data;

      // Actualizamos el estado local de técnicos
      setTecnicos(prev => [...prev, data]);
      setRefreshIndex(prev => prev + 1);
      
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al crear técnico:", message);
      throw new Error(message || 'Error al crear técnico');
    }
  };

  const actualizarTecnico = async (id, payload) => {
    try {
      // 💡 Usamos axiosClient.patch para inyectar token y x-tenant-id automáticamente
      const res = await axiosClient.patch(`/movements/technicians/${id}`, payload);
      const data = res.data;

      setTecnicos(prev => prev.map(t => Number(t.id) === Number(id) ? data : t));
      setRefreshIndex(prev => prev + 1);
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al actualizar técnico:", message);
      throw new Error(message || 'Error al actualizar técnico');
    }
  };

  const eliminarTecnico = async (id) => {
    try {
      // 💡 Usamos axiosClient.delete para inyectar token y x-tenant-id automáticamente
      const res = await axiosClient.delete(`/movements/technicians/${id}`);
      const data = res.data;

      setTecnicos(prev => prev.filter(t => Number(t.id) !== Number(id)));
      setRefreshIndex(prev => prev + 1);
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al eliminar técnico:", message);
      throw new Error(message || 'Error al eliminar técnico');
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
      return true;
    } catch (err) {
      console.error("Error en registrarTransferencia:", err);
      throw err;
    }
  };

  const registrarMovimientosMasivos = async (payload) => {
    try {
      let payloadLimpio = JSON.parse(JSON.stringify(payload)); 

      // Asegurarnos de limpiar propiedades de lotes y garantizar tipos correctos
      if (Array.isArray(payloadLimpio)) {
        payloadLimpio = payloadLimpio.map(({ numeroLote, lote, loteId, ...resto }) => ({
          ...resto,
          usuarioId: resto.usuarioId ? Number(resto.usuarioId) : 1
        }));
      } else if (payloadLimpio && Array.isArray(payloadLimpio.items)) {
        payloadLimpio.usuarioId = Number(payloadLimpio.usuarioId) || 1;
        payloadLimpio.nota = String(payloadLimpio.nota || "Salida masiva de inventario");
        
        payloadLimpio.items = payloadLimpio.items.map(({ numeroLote, lote, loteId, ...resto }) => ({
          ...resto,
          productoId: Number(resto.productoId),
          cantidad: Number(resto.cantidad),
          serials: Array.isArray(resto.serials) ? resto.serials : []
        }));
      }

      // 💡 Usamos axiosClient para que inyecte automáticamente el token y las cabeceras del tenant
      const res = await axiosClient.post('/movements/bulk-receive', payloadLimpio);

      setRefreshIndex(prev => prev + 1);
      
      return res.data;
    } catch (err) {
      // Axios encapsula los mensajes de error del backend en error.response.data
      const errorMessage = err.response?.data?.message || err.message;
      const errorMsg = `Error en el procesamiento masivo: ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}`;
      
      console.error(errorMsg, err);
      throw new Error(errorMsg); 
    }
  };

  // 2. Agregar Producto
  const agregarProducto = async (nuevoProducto) => {
    try {
      // 💡 Usamos axiosClient.post para que inyecte automáticamente el token y el x-tenant-id
      const res = await axiosClient.post('/products', nuevoProducto);

      const data = res.data;

      // Actualizamos el estado local agregando el producto nuevo
      setProductos(prev => [data, ...prev]);
      setRefreshIndex(prev => prev + 1);
      
      return data;
    } catch (err) {
      // Axios encapsula los errores del servidor en err.response.data
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al agregar producto:", message);
      throw new Error(message || 'Error al agregar el producto');
    }
  };

  // --- GESTIÓN DE PROVEEDORES (DB) ---
  const agregarProveedor = async (nuevoProveedor) => {
    try {
      // 💡 Usamos axiosClient.post para que inyecte automáticamente el token y el x-tenant-id
      const res = await axiosClient.post('/providers', nuevoProveedor);

      const data = res.data;

      // Actualizamos el estado local de proveedores si lo manejas aquí
      setProveedores(prev => [...prev, data]);
      setRefreshIndex(prev => prev + 1);
      
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al agregar proveedor:", message);
      throw new Error(message || 'Error al agregar el proveedor');
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
      // 💡 Usamos axiosClient.delete para que inyecte automáticamente el token y el x-tenant-id
      const res = await axiosClient.delete(`/providers/${id}`);

      // Actualizamos el estado local quitando el elemento eliminado
      setProveedores(prev => prev.filter(p => p.id !== id));
      setRefreshIndex(prev => prev + 1);
      
      return res.data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al eliminar proveedor:", message);
      throw new Error(message || 'No se pudo eliminar');
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
      // 💡 Usamos axiosClient.delete para que inyecte automáticamente el token y el x-tenant-id
      const res = await axiosClient.delete(`/products/${id}`);

      // Actualizamos el estado local quitando el producto eliminado
      setProductos(prev => prev.filter(p => p.id !== id));
      setRefreshIndex(prev => prev + 1);
      
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      console.error("Error al intentar eliminar producto:", message);
      throw new Error(message || 'Error al eliminar el producto');
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

  const actualizarProducto = async (id, productoEditado) => {
    try {
      // 1. Sacamos el id, fechas y extraemos 'serials' para evaluarlo
      const { id: _, createdAt, updatedAt, serials, ...datosLimpios } = productoEditado;
      const payloadEnvio = { ...datosLimpios };
      
      if (serials && Array.isArray(serials)) {
        payloadEnvio.serials = [...new Set(serials)];
      }

      // 2. 💡 Usamos axiosClient.patch para que inyecte automáticamente el token y el x-tenant-id del tenant
      const res = await axiosClient.patch(`/products/${id}`, payloadEnvio);

      const data = res.data;
      
      // 3. Actualizamos el estado local con los datos frescos del producto.
      setProductos(prev => prev.map(p => p.id === id ? data : p));
      setRefreshIndex(prev => prev + 1); // Opcional para asegurar sincronización global si lo usas
      return data;
    } catch (err) {
      // Axios encapsula los mensajes de error del backend en err.response.data
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage)
        ? errorMessage.join(', ')
        : errorMessage;
        
      console.error("Error en actualizarProducto:", message);
      throw new Error(message || 'Error al actualizar el producto'); 
    }
  };
  const obtenerProductos = async (page = 1, search = '') => {
      try {
        // 💡 Usamos axiosClient.get para que inyecte automáticamente el token y el x-tenant-id
        const res = await axiosClient.get('/products', {
          params: { page, limit: 20, ...(search ? { search } : {}) }
        });

        const responseData = res.data;
        const listaProductos = responseData.data || (Array.isArray(responseData) ? responseData : []);
        const meta = responseData.meta || {};

        setProductos(listaProductos);
        setPaginaActual(Number(meta.page || page));
        setTotalPaginas(Number(meta.lastPage || 1));
        setTotalRegistros(Number(meta.total || listaProductos.length));
        
        return listaProductos;
      } catch (err) {
        console.error("Error al consultar los productos:", err.response?.data || err.message);
        throw new Error('Error al consultar los productos');
      }
    };

  // --- GESTIÓN DE CATEGORÍAS (DB) ---
  const agregarCategoria = async (nuevaCategoria) => {
      try {
        // 💡 Usamos axiosClient.post para que inyecte automáticamente el token y el x-tenant-id
        const res = await axiosClient.post('/categories', nuevaCategoria);

        const data = res.data; 

        // Actualizamos el estado local de categorías si lo manejas en el contexto
        setCategorias(prev => [...prev, data]);
        setRefreshIndex(prev => prev + 1);
        
        return data;
      } catch (err) {
        const errorData = err.response?.data || {};
        const errorMessage = errorData.message || err.message;
        const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
        
        console.error("Error al agregar categoría:", message);
        throw new Error(message || 'Error al agregar la categoría');
      }
    };

  const actualizarCategoria = async (id, categoriaData) => {
    try {
      const url = `${API_BASE_URL}/categories/${id}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoriaData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar la categoría');
      }

      setCategorias(prev => prev.map(c => (c.id === id ? data : c)));
      return data;
    } catch (error) {
      console.error('Error en actualizarCategoria:', error);
      throw error;
    }
  };

  const eliminarCategoria = async (id) => {
    try {
      // 💡 Usamos axiosClient.delete para que inyecte automáticamente el token y el x-tenant-id
      const res = await axiosClient.delete(`/categories/${id}`);

      // Actualizamos el estado local eliminando la categoría de la lista
      setCategorias(prev => prev.filter(c => c.id !== id));
      setRefreshIndex(prev => prev + 1);
      
      return res.data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al eliminar categoría:", message);
      throw new Error(message || 'No se pudo eliminar la categoría');
    }
  };
 // 5. Descontar Stock
  const descontarStock = async (carritoItems, notaVenta = "Salida por Venta") => {
    try {
      if (!carritoItems || carritoItems.length === 0) {
        return;
      }

      const payloadMasivo = {
        tipo: 'SALIDA',
        usuarioId: usuario?.id ? Number(usuario.id) : 1,
        nota: String(notaVenta),
        items: carritoItems.map(item => ({
          productoId: Number(item.id || item.productoId),
          cantidad: Number(item.isSerialized ? (item.serials?.length || 1) : (item.cantidad || 1)),
          // 👈 Pasamos el nombre exacto del almacén en texto (ej: "ALMACEN OFICINA")
          almacen: String(item.almacen || item.almacenNombre || item.ubicacion?.almacen || "ALMACEN OFICINA"),
          serials: Array.isArray(item.serials) ? item.serials : []
        }))
      };

      // 🚀 Usamos axiosClient para que inyecte automáticamente el token y el x-tenant-id dinámico
      const res = await axiosClient.post('/movements/bulk-receive', payloadMasivo);

      setRefreshIndex(prev => prev + 1);
      return res.data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const mensajeObj = Array.isArray(errorMessage) 
        ? errorMessage.join(', ') 
        : errorMessage;

      console.error("Error al descontar stock:", mensajeObj);
      throw new Error(mensajeObj || 'Error al descontar stock');
    }
  };
  // --- GESTIÓN DE CONTEO FÍSICO (Auditoría) ---
  const cargarConteos = useCallback(async (almacen = '') => {
    try {
      // 💡 Usamos axiosClient.get con parámetros opcionales
      const res = await axiosClient.get('/inventory-counts', {
        params: almacen ? { almacen } : {}
      });
      
      const data = res.data;
      setConteos(Array.isArray(data) ? data : (data.data || data.items || []));
    } catch (err) {
      if (err.response?.status === 401) {
        console.warn("401: Este perfil no tiene autorización en el backend para ver conteos físicos.");
        setConteos([]);
        return;
      }
      console.error("Error cargando conteos:", err.response?.data?.message || err.message);
    }
  }, []);

  const crearConteo = async (payload) => {
    try {
      const res = await axiosClient.post('/inventory-counts', payload);
      const data = res.data;
      setConteos(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error("Error al crear conteo:", msg);
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const obtenerConteo = async (id) => {
    try {
      const res = await axiosClient.get(`/inventory-counts/${id}`);
      return res.data;
    } catch (err) {
      throw new Error('Conteo no encontrado');
    }
  };

  const agregarItemAConteo = async (conteoId, itemData) => {
    try {
      const res = await axiosClient.post(`/inventory-counts/${conteoId}/items`, itemData);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const actualizarItemConteo = async (conteoId, itemId, cantidad) => {
    try {
      const res = await axiosClient.patch(`/inventory-counts/${conteoId}/items/${itemId}`, {
        cantidadContada: Number(cantidad)
      });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const publicarConteo = async (id) => {
    try {
      const res = await axiosClient.post(`/inventory-counts/${id}/publish`);
      const data = res.data;
      setConteos(prev => prev.map(c => c.id === id ? data : c));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const eliminarConteo = async (id) => {
    try {
      await axiosClient.delete(`/inventory-counts/${id}`);
      setConteos(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error("Error eliminando conteo:", err);
      throw err;
    }
  };
  // --- GESTIÓN DE ALMACENES (DB) ---
  const agregarAlmacen = async (nuevoAlmacen) => {
    try {
      const res = await axiosClient.post('/warehouses', nuevoAlmacen, {
        headers: { 'x-inventory-permission': getWarehousePermission('create') },
      });

      const data = res.data;

      setAlmacenesDetallados(prev => [...prev, data]);
      setRefreshIndex(prev => prev + 1);
      
      return data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al crear almacén:", message);
      throw new Error(message || 'Error al crear almacén');
    }
  };
  
  const actualizarAlmacen = async (almacenActualizado) => {
    const { id, ...datos } = almacenActualizado;
    try {
      const res = await axiosClient.patch(`/warehouses/${id}`, datos, {
        headers: { 'x-inventory-permission': getWarehousePermission('edit') },
      });
      setAlmacenesDetallados(prev => prev.map(a => a.id === id ? res.data : a));
      setRefreshIndex(prev => prev + 1);
      return res.data;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      console.error("Error al actualizar almacén:", message);
      throw new Error(message || 'Error al actualizar almacén');
    }
  };

  const eliminarAlmacen = async (id) => {
    try {
      await axiosClient.delete(`/warehouses/${id}`, {
        headers: { 'x-inventory-permission': getWarehousePermission('delete') },
      });
      setAlmacenesDetallados(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) { console.error(err); throw err; }
  };

  // --- GESTIÓN DE LOTES ---
  const cargarLotes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory-batches`, { headers: getAuthHeaders() });
      if (res.status === 404) {
        setLotes([]);
        return;
      }
      if (!res.ok) throw new Error('Error al cargar lotes');
      const data = await res.json();
      setLotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("⚠️ Nota de desarrollo: El endpoint de lotes no está listo o falló:", err.message);
      setLotes([]);
    }
  }, [API_BASE_URL, getAuthHeaders]);

  const agregarLote = async (loteData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory-batches`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(loteData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear el lote');
      }
      const nuevoLote = await res.json();
      setLotes(prev => [nuevoLote, ...prev]);
      return nuevoLote;
    } catch (error) {
      console.error('Error en agregarLote:', error);
      throw error;
    }
  };

  const actualizarLote = async (id, loteData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory-batches/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(loteData),
      });
      if (!res.ok) throw new Error('Error al actualizar el lote');
      const loteActualizado = await res.json();
      setLotes(prev => prev.map(l => (l.id === id ? loteActualizado : l)));
      return loteActualizado;
    } catch (error) { throw error; }
  };

  const eliminarLote = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory-batches/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al eliminar el lote');
      setLotes(prev => prev.filter(l => l.id !== id));
    } catch (error) { throw error; }
  };

  // --- GESTIÓN DE COMODATO (PRÉSTAMOS) ---
  const cargarPrestamos = useCallback(async () => {
    try {
      const res = await axiosClient.get('/comodatos');
      const data = res.data;
      setPrestamos(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error("Error cargando comodatos:", msg);
      setPrestamos([]);
    }
  }, []);

  const crearPrestamo = async (payload) => {
    try {
      const res = await axiosClient.post('/comodatos', {
        ...payload,
        usuarioId: usuario?.id
      });

      const data = res.data;
      setPrestamos(prev => [data, ...prev]); 
      setRefreshIndex(prev => prev + 1);
      return true;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const mensajeObj = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      console.error("Error al registrar préstamo:", mensajeObj);
      throw new Error(mensajeObj || 'Error al registrar préstamo');
    }
  };

  const devolverPrestamo = async (comodatoId) => {
    try {
      const res = await axiosClient.post(`/comodatos/${comodatoId}/devolver`);
      const data = res.data;
      
      setPrestamos(prev => prev.map(p => p.id === comodatoId ? data : p));
      setRefreshIndex(prev => prev + 1);
      return true;
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || err.message;
      const mensajeObj = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      console.error("Error al devolver préstamo:", mensajeObj);
      throw new Error(mensajeObj || 'Error al devolver préstamo');
    }
  };

   // --- Funciones de Paginación Seguras ---
    const handlePaginaSiguiente = () => {
      if (Number(paginaActual) < Number(totalPaginas)) {
      
        cargarProductosPrioritarios(Number(paginaActual) + 1, terminosBusqueda);
      } else {
        console.warn("⚠️ No se puede avanzar más. Estás en la última página.");
      }
    };

    const handlePaginaAnterior = () => {
        if (Number(paginaActual) > 1) {
          cargarProductosPrioritarios(Number(paginaActual) - 1, terminosBusqueda);
        }
      };


  return (
    <InventarioContext.Provider value={{ 
      productos,
      paginaActual,
      totalPaginas,
      totalRegistros,
      tecnicos,
      prestamos,
      seriales,
      cargarSeriales,
      obtenerHistorialSerial,
      actualizarEstadoSerial,
      agregarCategoria,
      actualizarCategoria,
      eliminarCategoria,
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
      agregarLote,
      actualizarLote,
      eliminarLote,
      devolverSerialTecnico,
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
      almacenesDetallados,
      agregarAlmacen,
      actualizarAlmacen,
      eliminarAlmacen,
      setAlmacenesDetallados,
      agregarProducto,
      verEliminados,
      setVerEliminados,
      eliminarProducto,
      restaurarProducto,
      cargarProductosPrioritarios,
      actualizarProducto,
      obtenerProductos,
      actualizarSerial,
      eliminarSerial,
      descontarStock,
      registrarMovimiento, 
      crearTecnico,
      actualizarTecnico,
      eliminarTecnico,
      registrarTransferencia, 
      setTerminosBusqueda,
      terminosBusqueda,
      registrarMovimientosMasivos,
      cargarMovimientos,
      cargarConteos,
      handlePaginaSiguiente, 
      handlePaginaAnterior,
      handlePaginaSiguienteMovimientos,
      handlePaginaAnteriorMovimientos,
      setPaginaActual,
      paginaMovimientos,
      totalPaginasMovimientos,
      totalRegistrosMovimientos,
      recargarInventario: () => setRefreshIndex(prev => prev + 1)
    }}>
      {children}
    </InventarioContext.Provider>
  );
};

export const useInventario = () => useContext(InventarioContext);
