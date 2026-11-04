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

 //LA FUNCIÓN FUERA DEL USEEFFECT (A nivel del Provider)
  const cargarProductosPrioritarios = async (page = 1, query = terminoBusqueda) => {
    setLoading(true);
    setErrorConexion(null);
    try {
      const estadoFiltro = verEliminados === 'all' ? 'all' : verEliminados ? 'false' : 'true';
      
      // 💡 Usamos axiosClient pasándole los parámetros de forma limpia en un objeto `params`
      const res = await axiosClient.get('/products', {
        params: {
          page: page,
          limit: 20,
          isActive: estadoFiltro,
          ...(query && query.trim() !== '' ? { search: query.trim() } : {})
        },
        headers: {
          'x-user-id': usuario?.id || '',
          'x-inventory-permission': 'true', // Incluimos la cabecera personalizada que permite CORS
        }
      });
      
      // 💡 En Axios la respuesta viene en `res.data`
      const responseData = res.data;
      const listaProductos = responseData.data || (Array.isArray(responseData) ? responseData : []);
      const meta = responseData.meta || {};

      setProductos(listaProductos);
      
      setPaginaActual(Number(meta.page || page));
      setTotalPaginas(Number(meta.lastPage || 1));
      setTotalRegistros(Number(meta.total || listaProductos.length));
      
    } catch (error) {
      console.error("Error crítico al buscar productos:", error);
      setErrorConexion(error.response?.data?.message || error.message);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  //EL USEEFFECT QUE LLAMA A AMBAS FUNCIONES
  useEffect(() => {
    if (!usuario?.id) return;

    const headers = getAuthHeaders();
    if (!headers.Authorization || headers.Authorization.includes('undefined')) {
      return;
    }

    const cargarDatosSecundarios = async () => {
      const recursos = [
        { url: `${API_BASE_URL}/providers`, setter: setProveedores },
        { url: `${API_BASE_URL}/warehouses`, setter: setAlmacenesDetallados },
        { url: `${API_BASE_URL}/units-of-measure`, setter: setUnidadesMedida },
        { url: `${API_BASE_URL}/movements/technicians`, setter: setTecnicos },
        { url: `${API_BASE_URL}/categories`, setter: setCategorias },
        { url: `${API_BASE_URL}/movements`, setter: setMovimientos },
      ];

      const promesas = recursos.map((r) =>
        axiosClient.get(r.url, { headers }).then((res) => {
          if (!res.ok) throw new Error(`Fallo en ${r.url}`);
          return res.json();
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
          console.warn(`Advertencia al cargar ${recursos[index].url}:`, resultado.reason.message);
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
    const headers = getAuthHeaders();
    const fetchResource = async (url) => {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`Fallo al cargar ${url}: ${response.statusText}`);
      return response.json();
    };
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
  
const cargarMovimientos = useCallback(async (page = 1, tipo = 'todos', fechaInicio = '', fechaFin = '', productoId = null) => {
    if (!usuario) return;

    try {
      let url = `${API_BASE_URL}/movements`;
      const params = new URLSearchParams();
      
      params.append('page', page); // <--- Aquí viajará el 2 cuando sea la página siguiente
      params.append('limit', '20'); 
      if (productoId) params.append('productoId', productoId);
      if (tipo && tipo !== 'todos') params.append('tipo', tipo);
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      if (usuario.rol?.toLowerCase() !== 'admin') params.append('usuarioId', usuario.id);

      url += `?${params.toString()}`;

      // console.log("Enviando petición a URL:", url); // Para verificar que vaya page=2

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) return;
      
      const responseData = await res.json();
      const lista = Array.isArray(responseData) ? responseData : (responseData?.data || []);
      const meta = responseData.meta || { total: lista.length, page: 1, lastPage: 1 };

      // console.log("Respuesta del Backend - Meta:", meta, "Página solicitada en función:", page);

      if (!productoId) {
        setMovimientos(lista);
        // Actualizamos de manera estricta con lo que respondió el backend o lo que pedimos
        setPaginaMovimientos(Number(meta.page || page)); 
        setTotalPaginasMovimientos(Number(meta.lastPage || 1));
        setTotalRegistrosMovimientos(Number(meta.total || lista.length));
      }
      
      return lista;
    } catch (err) {
      console.error("Error al cargar movimientos:", err);
    }
  }, [API_BASE_URL, getAuthHeaders, usuario?.id, usuario?.rol]);

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
      const res = await fetch(`${API_BASE_URL}/product-serials`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al cargar los seriales de productos');
      const data = await res.json();
      const listaSeriales = Array.isArray(data) ? data : data?.data;
      setSeriales(Array.isArray(listaSeriales) ? listaSeriales : []);
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
        const message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message;
        throw new Error(message || 'Error al actualizar el serial');
      }

      // Actualizamos el estado global de productos para reflejar el cambio
      setRefreshIndex(prev => prev + 1);

      return data; // Devolvemos el serial actualizado
    } catch (err) {
      console.error('Error en actualizarSerial:', err);
      throw err;
    }
  };

  const eliminarSerial = async (id) => {
    const res = await fetch(`${API_BASE_URL}/product-serials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      throw new Error(message || 'Error al eliminar el serial');
    }

    setSeriales(prev => prev.filter(serial => serial.id !== id));
    setRefreshIndex(prev => prev + 1);
    return data;
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

    //console.log("Enviando Payload correcto a NestJS:", payload);

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

  const devolverSerialTecnico = async (serialNumber, nota, user) => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/movements/return-from-technician`;
        const authHeaders = getAuthHeaders();

        // 🛠️ Validación preventiva utilizando el parámetro 'user' pasado desde el componente
        if (!user || !user.id) {
          throw new Error('No se ha detectado una sesión activa. Por favor, vuelve a iniciar sesión.');
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            serialNumber, 
            nota,
            usuarioId: Number(user.id) // 👈 Inyección dinámica del ID numérico real
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Error al procesar la devolución');
        }

        // Si setRefreshIndex no está en el mismo archivo, asegúrate de pasarlo también o manejarlo en el context
        if (typeof setRefreshIndex === 'function') {
          setRefreshIndex(prev => prev + 1); 
        }
        
        return data;
      } catch (error) {
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
      return true;
    } catch (err) {
      console.error("Error en registrarTransferencia:", err);
      throw err;
    }
  };

 // --- DENTRO DE InventarioContext.jsx ---

const registrarMovimientosMasivos = async (payload) => {
  try {
    // 💡 CAMBIO CLAVE: Si vas a registrar salidas/ventas, asegúrate de apuntar 
    // a la ruta masiva correcta de salidas de tu backend (ej. bulk-outbound o bulk si aplica).
    // Si tu backend usa la misma para todo, déjala como bulk-receive, pero valida tu controlador.
    const url = `${API_BASE_URL}/movements/bulk-receive`; 
    
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

    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payloadLimpio) 
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

    setRefreshIndex(prev => prev + 1);
    
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

  const actualizarProducto = async (id, productoEditado) => {
  try {
    // 1. 🔑 Obtenemos los headers de autenticación
    const headers = getAuthHeaders(); 

    // 🚀 Sacamos el id, fechas y extraemos 'serials' para evaluarlo
    const { id: _, createdAt, updatedAt, serials, ...datosLimpios } = productoEditado;
    const payloadEnvio = { ...datosLimpios };
    
    if (serials && Array.isArray(serials)) {
      payloadEnvio.serials = [...new Set(serials)];
    }

    // 2. Enviamos la petición PATCH incluyendo los headers del token
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        ...headers, 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadEnvio), 
    });

    if (!res.ok) {
      const errorData = await res.json();
      const message = Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message;
      throw new Error(message || 'Error al actualizar el producto');
    }

    const data = await res.json();
    
    // 🚀 Actualizamos el estado local con los datos frescos del producto.
    setProductos(prev => prev.map(p => p.id === id ? data : p));
    return data;
  } catch (err) {
    console.error("Error en actualizarProducto:", err);
    throw err; 
  }
};

const obtenerProductos = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const res = await fetch(`${API_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Error al consultar los productos');

    const responseJson = await res.json();
    
    // 🛡️ BLINDAJE ADAPTADO A TU BACKEND:
    let listaProductos = [];

    if (Array.isArray(responseJson)) {
      listaProductos = responseJson;
    } else if (responseJson && Array.isArray(responseJson.data)) {
      // 👈 Esta es la estructura que te está devolviendo tu API ({ data: [...], meta: {...} })
      listaProductos = responseJson.data;
    } else if (responseJson && Array.isArray(responseJson.productos)) {
      listaProductos = responseJson.productos;
    } else {
      console.warn("La API no devolvió una estructura reconocida:", responseJson);
    }

    setProductos(listaProductos);
    return listaProductos;
  } catch (error) {
    console.error("Error en obtenerProductos:", error);
    throw error;
  }
};

  // --- GESTIÓN DE CATEGORÍAS (DB) ---
  const agregarCategoria = async (categoriaData) => {
  try {
    const url = `${API_BASE_URL}/categories`; // <-- CORRECCIÓN: Usar la URL base consistente
    const authHeaders = getAuthHeaders(); // <-- Ya incluye 'Content-Type' por defecto

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json', //¡Obligatorio para que NestJS procese el @Body!
      },
      body: JSON.stringify(categoriaData), // Envía { nombre: '...', descripcion: '...' }
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Error al crear la categoría');
    }

    setRefreshIndex(prev => prev + 1); // Dispara la actualización para recargar la lista en la UI
    return data;
  } catch (error) {
    console.error("Error en agregarCategoria:", error);
    throw error;
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
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('No se pudo eliminar la categoría');
      setCategorias(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      console.error('Error en eliminarCategoria:', error);
      throw error;
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

    const res = await fetch(`${API_BASE_URL}/movements/bulk-receive`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payloadMasivo)
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = 'Error al descontar stock';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = Array.isArray(errorJson.message) 
          ? errorJson.message.join(', ') 
          : errorJson.message;
      } catch {
        errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    setRefreshIndex(prev => prev + 1);
    return data;
  } catch (err) {
    console.error("Error al descontar stock:", err);
    throw err;
  }
};
  // --- GESTIÓN DE CONTEO FÍSICO (Auditoría) ---
  const cargarConteos = useCallback(async (almacen = '') => {
    try {
      const url = almacen 
        ? `${API_BASE_URL}/inventory-counts?almacen=${almacen}`
        : `${API_BASE_URL}/inventory-counts`;
      
      const headers = getAuthHeaders();
      
      if (!headers || !headers.Authorization || headers.Authorization.includes('undefined')) {
        console.warn("Carga de conteos pospuesta: El token de autenticación no está listo.");
        return;
      }

      const res = await fetch(url, { headers });
    
      if (res.status === 401) {
        console.warn("401: Este perfil no tiene autorización en el backend para ver conteos físicos.");
        setConteos([]);
        return;
      }

      if (!res.ok) throw new Error('Error al cargar conteos');
      
      const data = await res.json();
      setConteos(data);
    } catch (err) {
      console.error("Error cargando conteos:", err);
    }
  }, [API_BASE_URL, getAuthHeaders]);

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
      const res = await fetch(`${API_BASE_URL}/comodatos`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al cargar préstamos');
      const data = await res.json();
      setPrestamos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando comodatos:", err);
      setPrestamos([]);
    }
  }, [API_BASE_URL, getAuthHeaders]);

  const crearPrestamo = async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/comodatos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...payload,
          usuarioId: usuario?.id
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al registrar préstamo');
      }

      const data = await res.json();
      setPrestamos(prev => [data, ...prev]); 
      setRefreshIndex(prev => prev + 1);
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
      setRefreshIndex(prev => prev + 1);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
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
