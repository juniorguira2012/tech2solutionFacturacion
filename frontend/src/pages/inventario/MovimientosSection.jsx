// components/inventario/MovimientosSection.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftRight, List, Download, Truck, RefreshCw, Trash2, Search, X, UserCheck, Check } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';
import { useVentas } from '../../context/VentasContext';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions'; // Importamos el hook
import { useUsuarios } from '../../context/UsuariosContext';

// Importación de la lógica y subcomponentes extraídos
import { useMovimientosForm } from '../../hooks/useMovimientosForm';
import { FormTransferencia } from './FormTransferencia';
import { FormMovimientoSimple } from './FormMovimientoSimple';
import { FormAjuste } from '../../components/FormAjuste';

// 1. 🛡️ Recibimos 'permisos' desde el padre (Inventario.jsx)
const MovimientosSection = ({ mostrarToast, permisos }) => {
  // 🛡️ Extraemos los permisos específicos para esta sección
  const permisosMovimiento = permisos?.subModulos?.movimiento ?? permisos;

  const { 
    productos, movimientos, proveedores, tecnicos, seriales, registrarMovimiento, 
    registrarTransferencia, registrarMovimientosMasivos, asignarSerialesTecnico, 
    cargarMovimientos, recargarInventario, almacenesDetallados 
  } = useInventario();
  
  const { historialVentas } = useVentas();
  const { usuario } = useAuth();
  const { usuarios } = useUsuarios();
  
  const almacenesNombres = useMemo(() => almacenesDetallados.map(a => a.nombre), [almacenesDetallados]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');

  // Estados de control de la UI principal
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busquedaKardex, setBusquedaKardex] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const cerrarModal = () => { 
    setModalOpen(false);
    setTipoMovimiento(null);
    setItemsEnCarritoMovimiento([]);
    setBusquedaCarrito('');
    setResultadosBusquedaCarrito([]);
    setAsignacionTecnicoId('');
    setAsignacionSerialesInput('');
    setAsignacionIsLoading(false);
    setSerialesSeleccionados([]);
    setBusquedaSerial('');
    setSerialesDisponibles(seriales.filter(s => s.status === 'disponible'));
    setProveedorSeleccionado('');
  };

  // Inicialización de nuestro Custom Hook
  const formProps = useMovimientosForm(
    productos, registrarMovimiento, registrarTransferencia, registrarMovimientosMasivos, 
    recargarInventario, cerrarModal, mostrarToast, usuario, tipoMovimiento
  );

  const [itemsEnCarritoMovimiento, setItemsEnCarritoMovimiento] = useState([]);
  const [busquedaCarrito, setBusquedaCarrito] = useState('');
  const [resultadosBusquedaCarrito, setResultadosBusquedaCarrito] = useState([]); 
  const [resultadosBusquedaFactura, setResultadosBusquedaFactura] = useState([]);

  const [subTipoDevolucion, setSubTipoDevolucion] = useState('producto'); 
  const [busquedaFactura, setBusquedaFactura] = useState('');
  const [facturaEncontrada, setFacturaEncontrada] = useState(null);
  const [itemsDevolucion, setItemsDevolucion] = useState([]);

  const [asignacionTecnicoId, setAsignacionTecnicoId] = useState('');
  const [asignacionSerialesInput, setAsignacionSerialesInput] = useState('');
  const [asignacionIsLoading, setAsignacionIsLoading] = useState(false);
  const [serialesDisponibles, setSerialesDisponibles] = useState([]);
  const [serialesSeleccionados, setSerialesSeleccionados] = useState([]);
  const [busquedaSerial, setBusquedaSerial] = useState('');

  // Lógica de búsqueda para el carrito de movimientos masivos
  useEffect(() => {
    if (!busquedaCarrito.trim()) {
      setResultadosBusquedaCarrito([]);
      return;
    }
    const filtrados = productos.filter(p => 
      p.nombre?.toLowerCase().includes(busquedaCarrito.toLowerCase()) || 
      (p.codigo && p.codigo.toLowerCase().includes(busquedaCarrito.toLowerCase()))
    );
    setResultadosBusquedaCarrito(filtrados);
  }, [busquedaCarrito, productos]);

  // Lógica de búsqueda de facturas para el dropdown
  useEffect(() => {
    if (!busquedaFactura.trim()) {
      setResultadosBusquedaFactura([]);
      return;
    }
    const filtradas = historialVentas.filter(v => 
      v.id.toString().includes(busquedaFactura) || 
      v.cliente?.toLowerCase().includes(busquedaFactura.toLowerCase())
    ).slice(0, 5); 
    setResultadosBusquedaFactura(filtradas);
  }, [busquedaFactura, historialVentas]);

  // Cargar historial al montar el componente
  useEffect(() => {
    // 🛡️ CONTROL DE PERMISOS: Usamos el prop directamente y dependemos del usuario
    if (permisosMovimiento?.view) {
      cargarMovimientos();
    } else {
      mostrarToast?.("No tienes permisos para visualizar el historial de movimientos", "error");
    }
  }, [permisosMovimiento?.view, usuario, cargarMovimientos]);

  // Gestión del carrito masivo (Recibir / Despachar)
  const obtenerStockEnAlmacen = (producto, almacen) => {
    const stockAlmacen = producto.warehouseStocks?.find(s => s.almacen === almacen);
    if (stockAlmacen) return Number(stockAlmacen.cantidad) || 0;
    return producto.almacen === almacen ? Number(producto.stock) || 0 : 0;
  };

  const agregarAlCarritoMovimiento = (producto) => {
    // 🛡️ CONTROL DE PERMISOS: Bloqueo lógico con la propiedad desestructurada
    if (!permisosMovimiento?.create) {
      mostrarToast?.("Acción denegada: No tienes permisos de escritura.", "error");
      return;
    }

    const existe = itemsEnCarritoMovimiento.find(item => item.id === producto.id);
    if (existe) {
      mostrarToast?.("El producto ya está en la lista", "warning");
      return;
    }

    if (tipoMovimiento === 'despachar' && producto.stock <= 0) {
      mostrarToast?.(`No hay stock disponible para ${producto.nombre}`, "error");
      return;
    }

    const almacenInicial = producto.almacen || almacenesNombres[0] || 'Principal';
    const stockDisponibleAlmacen = obtenerStockEnAlmacen(producto, almacenInicial);

    if (tipoMovimiento === 'despachar' && stockDisponibleAlmacen <= 0) {
      mostrarToast?.(`No hay stock en ${almacenInicial} para ${producto.nombre}`, "error");
      return;
    }

    setItemsEnCarritoMovimiento([...itemsEnCarritoMovimiento, { 
      ...producto, 
      almacen: almacenInicial,
      lote: '',
      serials: producto.isSerialized ? [] : undefined, 
      serialsInput: producto.isSerialized ? '' : undefined, 
      cantidadMovimiento: tipoMovimiento === 'despachar' ? Math.min(1, stockDisponibleAlmacen) : 1,
    }]);
    setBusquedaCarrito('');
    setResultadosBusquedaCarrito([]);
  };

  // Función para cargar automáticamente los items de una factura al carrito
  const cargarItemsDeFactura = (factura) => {
    // 🛡️ CONTROL DE PERMISOS: Una devolución genera un movimiento de entrada (Creación)
    if (!permisosMovimiento?.create) {
      mostrarToast?.("No tienes permisos para procesar devoluciones", "error");
      return;
    }

    const itemsNuevos = factura.items.map(item => {
      const p = productos.find(prod => prod.id === item.productoId);
      return {
        ...p,
        id: item.productoId,
        nombre: p?.nombre || item.nombre,
        stock: p?.stock || 0,
        almacen: p?.almacen || 'Principal',
        cantidadMovimiento: item.cantidad
      };
    });

    const idsExistentes = new Set(itemsEnCarritoMovimiento.map(i => i.id));
    const itemsUnicos = itemsNuevos.filter(i => !idsExistentes.has(i.id));
    
    setItemsEnCarritoMovimiento([...itemsEnCarritoMovimiento, ...itemsUnicos]);
    setFacturaEncontrada(factura);
    setBusquedaFactura(factura.id.toString());
    setResultadosBusquedaFactura([]);
    mostrarToast?.(`Cargados ${itemsUnicos.length} productos de la factura ${factura.id}`, "success");
  };

  const abrirModal = (tipo) => {
    // 🛡️ CONTROL DE PERMISOS: Filtramos las operaciones prohibidas antes de levantar el modal
    if (!permisosMovimiento?.create) {
      mostrarToast?.(`No tienes autorización para realizar la acción: ${tipo.toUpperCase()}`, "error");
      return;
    }

    setTipoMovimiento(tipo);
    setItemsEnCarritoMovimiento([]);
    setBusquedaCarrito('');
    setSubTipoDevolucion('producto');
    setItemsDevolucion([]);
    setBusquedaFactura('');
    setFacturaEncontrada(null);
    setAsignacionTecnicoId(''); setAsignacionSerialesInput('');

    // Limpieza de la nueva UI de asignación de seriales
    setSerialesSeleccionados([]);
    setBusquedaSerial('');
    setSerialesDisponibles(seriales.filter(s => s.status === 'disponible'));
    
    // Reseteamos el estado interno del formulario
    formProps.setMovimientoData({ productoId: '', cantidad: 1, almacenDestino: almacenesNombres[0] || 'Principal', nota: '' });
    formProps.setAjusteProductoId('');
    formProps.setAjusteAlmacen('');
    formProps.setAjusteCantidad('');
    formProps.setAjusteCosto('');
    formProps.setAjusteNota('');
    setModalOpen(true);
  };

  // Procesamiento Masivo (Lógica pesada delegada al context)
  const processarMovimientoMasivo = async () => {
    if (itemsEnCarritoMovimiento.length === 0) return;
    
    // Validación: Asegurar proveedor en entradas
    if ((tipoMovimiento === 'recibir' || tipoMovimiento === 'multilinea') && !proveedorSeleccionado) {
      mostrarToast?.("Por favor seleccione el proveedor de la mercancía", "warning");
      return;
    }

    const lineaInvalida = itemsEnCarritoMovimiento.find(item => Number(item.cantidadMovimiento) <= 0 || !item.almacen);
    if (lineaInvalida) {
      mostrarToast?.(`Revisa cantidad y almacén para ${lineaInvalida.nombre}`, "warning");
      return;
    }

    try {
      const tipo = tipoMovimiento === 'despachar' ? 'DESPACHAR' : 'RECIBIR';
      const prefijoNota = tipo === 'RECIBIR' ? 'Recibo de Inventario' : 'Despacho de Inventario';

      if (tipo === 'DESPACHAR') {
        for (const item of itemsEnCarritoMovimiento) {
          const stockDisponible = obtenerStockEnAlmacen(item, item.almacen || 'Principal');
          if (Number(item.cantidadMovimiento) > stockDisponible) {
            throw new Error(`Stock insuficiente en ${item.almacen} para ${item.nombre}. Disponible: ${stockDisponible}`);
          }
        }
      }

      const payload = {
        tipo: tipo, 
        nota: `${prefijoNota} ${proveedorSeleccionado ? `(Prov: ${proveedorSeleccionado})` : ''} - ${new Date().toLocaleDateString()}`,
        items: itemsEnCarritoMovimiento.map(item => {
          const baseItem = {
            productoId: item.id,
            almacen: item.almacen || 'Principal',
          };
          if (item.isSerialized) {
            return { ...baseItem, serials: item.serials };
          }
          return { 
            ...baseItem, 
            cantidad: Number(item.cantidadMovimiento),
            lote: item.lote 
          };
        }),
        referencia: facturaEncontrada?.id || undefined,
        usuarioId: Number(usuario?.id)
      };

      // Ejecutamos la petición al backend
      const resultado = await registrarMovimientosMasivos(payload); 

      // 🚨 CORRECCIÓN CRÍTICA: Validamos si retornó datos (si no hay error, es exitoso)
      if (resultado) {
        // Si tu backend devuelve un array, contamos los elementos; si no, usamos el largo del carrito
        const totalLineas = Array.isArray(resultado) ? resultado.length : (resultado.count || itemsEnCarritoMovimiento.length);
        
        // 1. Mostramos la notificación verde de éxito
        mostrarToast?.(`${totalLineas} línea${totalLineas === 1 ? '' : 's'} de inventario procesada${totalLineas === 1 ? '' : 's'} correctamente`, "success");
        
        // 2. Limpiamos el carrito multi-línea para que no se dupliquen datos
        setItemsEnCarritoMovimiento([]); 
        
        // 3. Cerramos el modal de una vez por todas
        cerrarModal();
        
        // 4. Refrescamos el inventario de la pantalla principal para ver el stock actualizado
        recargarInventario();
      }
    } catch (error) {
      console.error("Error en flujo masivo:", error);
      mostrarToast?.(error.message || "Error crítico: No se pudo procesar el ingreso", "error");
    }
  };

  const procesarDevolucionFactura = async () => {
    setModalOpen(false);
    let errores = 0;

    for (const item of itemsDevolucion) {
      const prod = productos.find(p => p.id === item.productoId);
      if (prod && item.cantidadADevolver > 0) {
        const exito = await registrarMovimiento({
          productoId: prod.id,
          tipo: 'DEVOLUCION_FACTURA',
          cantidad: item.cantidadADevolver,
          referencia: busquedaFactura
        });
        if (!exito) errores++;
      }
    }
    if (errores > 0) mostrarToast?.(`Devolución parcial con ${errores} errores`, 'warning');
    else mostrarToast?.('Devolución de factura procesada con éxito', 'success');
  };

  // Filtrado reactivo de la tabla Kardex (Memoizado)
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter(m => {
      const matchBusqueda = (m.producto?.nombre || "").toLowerCase().includes(busquedaKardex.toLowerCase()) || 
                           (m.producto?.codigo || "").toLowerCase().includes(busquedaKardex.toLowerCase());
      const matchTipo = filtroTipo === 'todos' || m.tipo.toUpperCase() === filtroTipo.toUpperCase();
      
      const fechaMov = new Date(m.createdAt);
      const inicio = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : null;
      const fin = fechaFin ? new Date(fechaFin + 'T23:59:59') : null;
      
      const matchFecha = (!inicio || fechaMov >= inicio) && (!fin || fechaMov <= fin);

      return matchBusqueda && matchTipo && matchFecha;
    });
  }, [movimientos, busquedaKardex, filtroTipo, fechaInicio, fechaFin]);

const exportarKardexCSV = () => {
    if (movimientosFiltrados.length === 0) {
      mostrarToast?.("No hay movimientos para exportar", "warning");
      return;
    }

    const headers = ["Fecha", "Producto", "Código", "Técnico", "Usuario", "Tipo", "Cantidad", "Stock Final", "Nota"];
    
    const rows = movimientosFiltrados.map(m => {
      const nombreUsuario = m.usuario?.nombre || m.usuarioId || 'Sistema';

      // Helper para escapar comillas dobles y envolver de forma segura cada campo
      const mapearCampo = (valor) => {
        const texto = String(valor ?? '').replace(/"/g, '""'); // Dobla comillas internas
        return `"${texto}"`; // Encapitula el texto
      };

      return [
        mapearCampo(new Date(m.createdAt).toLocaleString()),
        mapearCampo(m.producto?.nombre || '---'),
        mapearCampo(m.producto?.codigo || '---'),
        mapearCampo(m.technician?.nombre || ''),
        mapearCampo(nombreUsuario),
        mapearCampo(m.tipo),
        mapearCampo(m.cantidad),
        mapearCampo(m.nuevoStock ?? '---'),
        mapearCampo(m.nota || '')
      ].join(",");
    });

    // 1. Forzamos a Excel a usar la coma como separador explícito
    const csvContent = "sep=,\n" + headers.join(",") + "\n" + rows.join("\n");

    try {
      // 2. Creamos el Blob agregando el BOM (\uFEFF) para mantener los acentos intactos
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // 3. Generamos el link de descarga virtual temporal
      const link = document.createElement("a");
      link.href = url;
      
      const fechaFormateada = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `Kardex_Inventario_${fechaFormateada}.csv`);
      
      // 4. Disparamos la descarga y limpiamos la memoria del navegador
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      mostrarToast?.("Kardex exportado con éxito", "success");
    } catch (error) {
      console.error("Error al exportar Kardex:", error);
      mostrarToast?.("No se pudo generar el archivo del Kardex", "error");
    }
  };
      // Agrega esta función dentro de tu componente MovimientosSection para procesar el formulario
    // Modifica esta función dentro de tu componente MovimientosSection
  const procesarAsignacionTecnico = async () => {
    if (!asignacionTecnicoId) {
      mostrarToast?.("Seleccione un técnico", "warning");
      return;
    }
    if (serialesSeleccionados.length === 0) {
      mostrarToast?.("Ingrese al menos un serial", "warning");
      return;
    }

    // 1. Obtenemos los números de serie de los objetos seleccionados
    const listaSeriales = serialesSeleccionados.map(s => s.serialNumber);

    // 🚨 CONTROL DE SEGURIDAD PARA EL USUARIO ACTIVO
    // Validamos que el usuario activo tenga un ID antes de continuar.
    if (!usuario?.id) {
      mostrarToast?.("No se ha detectado una sesión de usuario activa.", "error");
      return;
    }

    setAsignacionIsLoading(true);
    try {
      // 2. Llamamos a la función de tu InventarioContext pasando los tipos de datos correctos
      const exito = await asignarSerialesTecnico({
        technicianId: Number(asignacionTecnicoId),
        serials: listaSeriales, // Array de strings listo
        usuarioId: Number(usuario.id), // Asegura un entero válido
        nota: `Asignación masiva de ${listaSeriales.length} equipos.`
      });

      if (exito) {
        mostrarToast?.(`${listaSeriales.length} seriales asignados al técnico con éxito`, "success");
        cerrarModal();
        recargarInventario();
      }
    } catch (error) {
      console.error(error);
      // Aquí capturamos los errores de validación formateados que envíe el backend
      mostrarToast?.(error.message || "Error al asignar seriales al técnico", "error");
    } finally {
      setAsignacionIsLoading(false);
    }
  };

  const esFlujoMovimientoMasivo = tipoMovimiento === 'multilinea' || tipoMovimiento === 'recibir' || tipoMovimiento === 'despachar';

  // Lógica para la nueva UI de selección de seriales
  const handleSelectSerial = (serial) => {
    setSerialesSeleccionados(prev => [...prev, serial]);
    setSerialesDisponibles(prev => prev.filter(s => s.id !== serial.id));
  };

  const handleDeselectSerial = (serial) => {
    setSerialesDisponibles(prev => [...prev, serial]);
    setSerialesSeleccionados(prev => prev.filter(s => s.id !== serial.id));
  };

  const serialesDisponiblesFiltrados = useMemo(() => {
    if (!busquedaSerial) return serialesDisponibles;
    const query = busquedaSerial.toLowerCase();
    return serialesDisponibles.filter(s => 
      s.serialNumber.toLowerCase().includes(query) ||
      s.producto?.nombre.toLowerCase().includes(query)
    );
  }, [busquedaSerial, serialesDisponibles]);

 // Puedes dejar este array fuera del componente o justo arriba del return
const BOTONES_ACCION = [
  { id: 'multilinea', label: 'Recibo multi-línea', icon: List, color: 'bg-slate-900 hover:bg-brand' },
  { id: 'recibir', label: 'Recibir', icon: Download, color: 'bg-emerald-500 hover:bg-emerald-600' },
  { id: 'despachar', label: 'Despachar', icon: Truck, color: 'bg-sky-500 hover:bg-sky-600' },
  { id: 'transferir', label: 'Transferir', icon: ArrowLeftRight, color: 'bg-indigo-500 hover:bg-indigo-600' },
  { id: 'ajustar', label: 'Ajustar', icon: RefreshCw, color: 'bg-amber-500 hover:bg-amber-600' },
  { id: 'devolucion', label: 'Devolución', icon: RefreshCw, color: 'bg-purple-500 hover:bg-purple-600' },
  { id: 'descartar', label: 'Descartar', icon: Trash2, color: 'bg-rose-500 hover:bg-rose-600' },
];

return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* CARD SUPERIOR DE ACCIONES */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand text-white rounded-xl shadow-lg shadow-indigo-100">
            <ArrowLeftRight size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">Movimientos de inventario</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kardex y Logística de Stock</p>
          </div>
        </div>

        {/* Mapeo dinámico y limpio de botones controlado por permisos */}
        {permisosMovimiento?.create && (
          <div className="flex flex-wrap gap-2">
            {BOTONES_ACCION.map((btn) => {
              const IconoBtn = btn.icon;
              return (
                <button
                  key={btn.id}
                  onClick={() => abrirModal(btn.id)}
                  className={`flex items-center gap-2 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md transition-all active:scale-95 ${btn.color}`}
                >
                  <IconoBtn size={14} /> {btn.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FILTROS DE BÚSQUEDA Y RANGOS */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={busquedaKardex}
            onChange={(e) => setBusquedaKardex(e.target.value)}
            placeholder="Buscar producto por nombre o código..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white shadow-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-white px-4 rounded-xl border border-slate-200 shadow-sm h-11">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-slate-400 italic">Desde</span>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="outline-none text-[10px] font-bold text-slate-600 bg-transparent cursor-pointer" />
          </div>
          <div className="w-[1px] h-4 bg-slate-100 mx-1"></div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-slate-400 italic">Hasta</span>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="outline-none text-[10px] font-bold text-slate-600 bg-transparent cursor-pointer" />
          </div>
          {(fechaInicio || fechaFin) && (
            <button onClick={() => { setFechaInicio(""); setFechaFin(""); }} className="ml-1 text-slate-300 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        <select 
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-black text-[10px] uppercase text-slate-600 bg-white shadow-sm cursor-pointer lg:w-48">
          <option value="todos">Todos los movimientos</option>
          <option value="RECIBIR">Recibos</option>
          <option value="DESPACHAR">Despachos</option>
          <option value="TRANSFERIR">Transferencias</option>
          <option value="AJUSTAR">Ajustes</option>
          <option value="DEVOLUCION">Devoluciones</option>
          <option value="DESCARTAR">Descartes</option>
        </select>

        <button onClick={exportarKardexCSV} className="h-11 px-6 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-emerald-600 transition-all flex items-center gap-2">
          <Download size={16} /> Exportar
        </button>
      </div>

      {/* TABLA PRINCIPAL DEL KARDEX */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {movimientosFiltrados.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b text-[9px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Origen</th>
                <th className="px-6 py-4">Destino</th>
                <th className="px-6 py-4">Técnico</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-center">Cant.</th>
                <th className="px-6 py-4 text-right">Stock Final</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[11px]">
              {movimientosFiltrados.map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-bold text-slate-500">{new Date(mov.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-3 font-black text-slate-800 uppercase">{mov.producto?.nombre}</td>
                  <td className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">{mov.almacenOrigen || 'N/A'}</td>
                  <td className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">{mov.almacenDestino || 'N/A'}</td>
                  <td className="px-6 py-3 text-[10px] font-black text-brand uppercase">{mov.technician?.nombre || 'N/A'}</td>
                  <td className="px-6 py-3 font-bold text-slate-400 uppercase italic">
                    {mov.usuario?.nombre || mov.usuarioId || 'Sistema'}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-white ${
                      mov.tipo.includes('RECIBIR') || mov.tipo.includes('DEVOLUCION') ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}>
                      {mov.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center font-black">{mov.cantidad}</td>
                  <td className="px-6 py-3 text-right font-black text-brand">{mov.nuevoStock ?? mov.producto?.stock ?? '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-20 text-center space-y-3">
            <ArrowLeftRight className="mx-auto text-slate-200" size={40} />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No hay movimientos registrados</p>
          </div>
        )}
      </div>

      {/* MODAL ÚNICO DE FLUJOS DINÁMICOS */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg">
                  <ArrowLeftRight size={20} />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase italic tracking-wider">
                  {tipoMovimiento === 'multilinea' ? 'Recibo Multi-línea' : 
                  tipoMovimiento === 'recibir' ? 'Recibir Inventario' : 
                  tipoMovimiento === 'despachar' ? 'Despachar Inventario' : 
                  tipoMovimiento === 'devolucion' ? 'Devolución de Stock' : `${tipoMovimiento}`}
                </h2>
              </div>
              <button onClick={cerrarModal} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400">
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo Reactivo */}
            <div className="p-6">
              
              {/* 1. FLUJOS MASIVOS (CARRITO) */}
              {esFlujoMovimientoMasivo && (
                <div className="space-y-4 relative">
                  {(tipoMovimiento === 'recibir' || tipoMovimiento === 'multilinea') && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Proveedor de Mercancía</label>
                      <select 
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
                        value={proveedorSeleccionado}
                        onChange={(e) => setProveedorSeleccionado(e.target.value)}
                      >
                        <option value="">Seleccionar Proveedor...</option>
                        {proveedores.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="relative">
                    <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Vincular con Factura (Opcional)..."
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-slate-50/50"
                      value={busquedaFactura}
                      onChange={(e) => setBusquedaFactura(e.target.value)}
                    />
                    {resultadosBusquedaFactura.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl z-[60] p-1">
                        {resultadosBusquedaFactura.map(f => (
                          <div key={f.id} onClick={() => cargarItemsDeFactura(f)} className="px-4 py-2 hover:bg-brand/5 rounded-lg cursor-pointer transition-colors border-b last:border-0">
                            <p className="text-[10px] font-black text-slate-700">FACTURA #{f.id}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{f.cliente} - {f.total.toLocaleString()} USD</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder={tipoMovimiento === 'despachar' ? "Buscar producto para despachar..." : "Buscar producto para recibir..."}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
                      value={busquedaCarrito}
                      onChange={(e) => setBusquedaCarrito(e.target.value)}
                    />
                    {resultadosBusquedaCarrito.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 max-h-48 overflow-y-auto p-2">
                        {resultadosBusquedaCarrito.map(prod => (
                          <div key={prod.id} onClick={() => agregarAlCarritoMovimiento(prod)} className="flex justify-between items-center px-4 py-2 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors">
                            <span className="text-[10px] font-black text-slate-700 uppercase">{prod.nombre} ({prod.codigo})</span>
                            <span className="text-[9px] font-bold text-brand">STOCK: {prod.stock}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 sticky top-0">
                          <tr>
                            <th className="px-4 py-2.5">Producto</th>
                            <th className="px-4 py-2.5 w-28">Almacén</th>
                            <th className="px-4 py-2.5 w-24">
                              {itemsEnCarritoMovimiento.some(i => i.isSerialized) ? 'Seriales / Cant.' : 'Cantidad'}
                            </th>
                            {(tipoMovimiento === 'recibir' || tipoMovimiento === 'multilinea') && (
                              <th className="px-4 py-2.5 w-32">Lote</th>
                            )}
                            <th className="px-4 py-2.5"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {itemsEnCarritoMovimiento.map((item, idx) => (
                            <tr key={item.id} className="text-sm">
                              <td className="px-4 py-2 font-bold text-slate-700">
                                <p className="text-[10px] uppercase font-black leading-tight">{item.nombre}</p>
                                <p className="text-[8px] text-slate-400 font-bold">
                                  STOCK ALMACÉN: {tipoMovimiento === 'despachar' ? obtenerStockEnAlmacen(item, item.almacen || 'Principal') : item.stock}
                                </p>
                              </td>
                              <td className="px-4 py-2">
                                <select
                                  className="w-full p-1.5 border rounded-lg font-black text-[9px] uppercase bg-white"
                                  value={item.almacen || ''}
                                  onChange={(e) => {
                                    const nuevaLista = [...itemsEnCarritoMovimiento];
                                    nuevaLista[idx].almacen = e.target.value;
                                    if (tipoMovimiento === 'despachar') {
                                      const disponible = obtenerStockEnAlmacen(nuevaLista[idx], e.target.value);
                                      nuevaLista[idx].cantidadMovimiento = Math.min(Number(nuevaLista[idx].cantidadMovimiento) || 1, Math.max(disponible, 0));
                                    }
                                    setItemsEnCarritoMovimiento(nuevaLista);
                                  }}
                                >
                                  {(almacenesNombres.length > 0 ? almacenesNombres : ['Principal']).map(almacen => (
                                    <option key={almacen} value={almacen}>{almacen}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                {item.isSerialized ? (
                                  <div className="relative">
                                    <textarea
                                      placeholder="Un serial por línea..."
                                      className="w-full p-1.5 border rounded-lg font-mono text-[9px] h-16 resize-y"
                                      value={item.serialsInput}
                                      onChange={(e) => {
                                        const nuevaLista = [...itemsEnCarritoMovimiento];
                                        const input = e.target.value;
                                        const serialsArray = input.split('\n').map(s => s.trim()).filter(Boolean);
                                        nuevaLista[idx].serialsInput = input;
                                        nuevaLista[idx].serials = serialsArray;
                                        nuevaLista[idx].cantidadMovimiento = serialsArray.length;
                                        setItemsEnCarritoMovimiento(nuevaLista);
                                      }}
                                    />
                                    <span className="absolute bottom-1 right-1.5 text-[8px] font-bold bg-slate-200 text-slate-500 px-1 rounded">
                                      {item.serials?.length || 0}
                                    </span>
                                  </div>
                                ) : (
                                  <input 
                                    type="number" min="1"
                                    max={tipoMovimiento === 'despachar' ? obtenerStockEnAlmacen(item, item.almacen || 'Principal') : undefined}
                                    className="w-full p-1.5 border rounded-lg font-black text-center text-[10px]"
                                    value={item.cantidadMovimiento}
                                    onChange={(e) => {
                                      const nuevaLista = [...itemsEnCarritoMovimiento];
                                      nuevaLista[idx].cantidadMovimiento = parseInt(e.target.value) || 0;
                                      setItemsEnCarritoMovimiento(nuevaLista);
                                    }}
                                  />
                                )}
                              </td>
                              {(tipoMovimiento === 'recibir' || tipoMovimiento === 'multilinea') && (
                                <td className="px-4 py-2">
                                  <input 
                                    type="text"
                                    placeholder="Nº Lote"
                                    className="w-full p-1.5 border rounded-lg font-bold text-[10px] uppercase"
                                    value={item.lote || ''}
                                    onChange={(e) => {
                                      const nuevaLista = [...itemsEnCarritoMovimiento];
                                      nuevaLista[idx].lote = e.target.value;
                                      setItemsEnCarritoMovimiento(nuevaLista);
                                    }}
                                  />
                                </td>
                              )}
                              <td className="px-4 py-2 text-right">
                                <button onClick={() => setItemsEnCarritoMovimiento(itemsEnCarritoMovimiento.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-600">
                                  <X size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {itemsEnCarritoMovimiento.length === 0 && (
                      <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase">Lista vacía</p>
                    )}
                  </div>

                  <button 
                    disabled={itemsEnCarritoMovimiento.length === 0 || !permisosMovimiento?.create}
                    onClick={processarMovimientoMasivo}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 transition-colors ${
                      tipoMovimiento === 'despachar' ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {tipoMovimiento === 'despachar' ? 'Confirmar Despacho' : 'Procesar Entrada'}
                  </button>
                </div>
              )}

              {/* 2. FLUJO DE DEVOLUCIONES */}
              {tipoMovimiento === 'devolucion' && (
                <div className="space-y-6">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setSubTipoDevolucion('producto')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${subTipoDevolucion === 'producto' ? 'bg-white text-brand shadow-sm' : 'text-slate-400'}`}>Por Producto</button>
                    <button type="button" onClick={() => setSubTipoDevolucion('factura')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${subTipoDevolucion === 'factura' ? 'bg-white text-brand shadow-sm' : 'text-slate-400'}`}>Por Factura</button>
                  </div>
                  
                  {subTipoDevolucion === 'producto' ? (
                    <FormMovimientoSimple 
                      tipoMovimiento={tipoMovimiento}
                      productos={productos}
                      almacenesDisponibles={almacenesNombres}
                      onSubmit={formProps.ejecutarMovimiento}
                      movimientoData={formProps.movimientoData}
                      setMovimientoData={formProps.setMovimientoData}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Buscar factura por número o cliente..." 
                          className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-brand font-bold text-sm bg-white shadow-sm"
                          value={busquedaFactura} 
                          onChange={(e) => setBusquedaFactura(e.target.value)} 
                        />
                        {resultadosBusquedaFactura.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 overflow-hidden">
                            {resultadosBusquedaFactura.map(f => (
                              <div key={f.id} onClick={() => { setFacturaEncontrada(f); setBusquedaFactura(f.id); setResultadosBusquedaFactura([]); }} className="p-4 hover:bg-brand/5 cursor-pointer border-b last:border-0 transition-colors">
                                <div className="flex justify-between items-center">
                                  <span className="font-black text-slate-800 text-xs">FACTURA #{f.id}</span>
                                  <span className="text-[10px] font-bold text-brand">{f.total.toLocaleString()} USD</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{f.cliente}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {facturaEncontrada && (
                        <div className="space-y-4">
                          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                            <p className="text-[9px] font-black text-brand uppercase">Factura: {facturaEncontrada.id}</p>
                            <p className="text-[11px] font-bold text-slate-700">{facturaEncontrada.cliente}</p>
                          </div>
                          <button onClick={procesarDevolucionFactura} className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Procesar Devolución Total</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. SUBCOMPONENTE DE TRANSFERENCIAS DIRECTAS */}
              {tipoMovimiento === 'transferir' && (
                <FormTransferencia 
                  productos={productos}
                  almacenesDisponibles={almacenesNombres}
                  onSubmit={formProps.ejecutarMovimiento}
                  {...formProps}
                />
              )}

              {/* 4. MOVIMIENTOS SIMPLES DIRECTOS (Descartar) */}
              {tipoMovimiento === 'descartar' && (
                <FormMovimientoSimple 
                  tipoMovimiento={tipoMovimiento}
                  productos={productos}
                  almacenesDisponibles={almacenesNombres}
                  onSubmit={formProps.ejecutarMovimiento}
                  movimientoData={formProps.movimientoData}
                  setMovimientoData={formProps.setMovimientoData}
                />
              )}

              {/* 5. FORMULARIO DE AJUSTE AVANZADO */}
              {tipoMovimiento === 'ajustar' && (
                <FormAjuste 
                  productos={productos}
                  almacenesDisponibles={almacenesNombres}
                  onSubmit={formProps.ejecutarMovimiento}
                  ajusteProductoId={formProps.ajusteProductoId}
                  setAjusteProductoId={formProps.setAjusteProductoId}
                  almacenDestino={formProps.ajusteAlmacen}
                  setAlmacenDestino={formProps.setAjusteAlmacen}
                  ajusteCantidad={formProps.ajusteCantidad}
                  setAjusteCantidad={formProps.setAjusteCantidad}
                  ajusteCosto={formProps.ajusteCosto}
                  setAjusteCosto={formProps.setAjusteCosto}
                  ajusteNota={formProps.ajusteNota}
                  setAjusteNota={formProps.setAjusteNota}
                />
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovimientosSection;
