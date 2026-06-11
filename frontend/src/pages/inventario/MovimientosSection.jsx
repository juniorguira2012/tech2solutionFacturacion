// components/inventario/MovimientosSection.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftRight, List, Download, Truck, RefreshCw, Trash2, Search, X } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';
import { useVentas } from '../../context/VentasContext';
import { useAuth } from '../../context/AuthContext';
import { useUsuarios } from '../../context/UsuariosContext';

// Importación de la lógica y subcomponentes extraídos
import { useMovimientosForm } from '../../hooks/useMovimientosForm';
import { FormTransferencia } from './FormTransferencia';
import { FormMovimientoSimple } from './FormMovimientoSimple';
import { FormAjuste } from '../../components/FormAjuste';

const MovimientosSection = ({ mostrarToast }) => {
  const { productos, movimientos, proveedores, registrarMovimiento, registrarTransferencia, registrarMovimientosMasivos, cargarMovimientos, recargarInventario, almacenesDetallados } = useInventario();
  const { historialVentas } = useVentas();
  const { usuario } = useAuth();
  const { usuarios } = useUsuarios();
  
  // Mapeamos los almacenes detallados a una lista de nombres para el selector
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
    setProveedorSeleccionado('');
  };

  // Inicialización de nuestro Custom Hook
  const formProps = useMovimientosForm(
    productos, registrarMovimiento, registrarTransferencia, registrarMovimientosMasivos, 
    recargarInventario, cerrarModal, mostrarToast, usuario, tipoMovimiento
  );

  // Estados específicos para los flujos masivos y devoluciones que se quedaron en la vista principal
  const [itemsEnCarritoMovimiento, setItemsEnCarritoMovimiento] = useState([]);
  const [busquedaCarrito, setBusquedaCarrito] = useState('');
  const [resultadosBusquedaCarrito, setResultadosBusquedaCarrito] = useState([]); // Mantener este estado local
  const [resultadosBusquedaFactura, setResultadosBusquedaFactura] = useState([]);

  const [subTipoDevolucion, setSubTipoDevolucion] = useState('producto'); 
  const [busquedaFactura, setBusquedaFactura] = useState('');
  const [facturaEncontrada, setFacturaEncontrada] = useState(null);
  const [itemsDevolucion, setItemsDevolucion] = useState([]);

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
    ).slice(0, 5); // Limitamos a 5 resultados para el dropdown
    setResultadosBusquedaFactura(filtradas);
  }, [busquedaFactura, historialVentas]);

  // Cargar historial al montar el componente
  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  // Gestión del carrito masivo (Recibir / Despachar)
  const agregarAlCarritoMovimiento = (producto) => {
    const existe = itemsEnCarritoMovimiento.find(item => item.id === producto.id);
    if (existe) {
      mostrarToast?.("El producto ya está en la lista", "warning");
      return;
    }

    if (tipoMovimiento === 'despachar' && producto.stock <= 0) {
      mostrarToast?.(`No hay stock disponible para ${producto.nombre}`, "error");
      return;
    }

    setItemsEnCarritoMovimiento([...itemsEnCarritoMovimiento, { 
      ...producto, 
      almacen: producto.almacen || almacenesNombres[0] || 'Principal',
      lote: '',
      cantidadMovimiento: tipoMovimiento === 'despachar' ? Math.min(1, producto.stock) : 1,
    }]);
    setBusquedaCarrito('');
    setResultadosBusquedaCarrito([]);
  };

  // Función para cargar automáticamente los items de una factura al carrito
  const cargarItemsDeFactura = (factura) => {
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

    // Evitar duplicados al cargar
    const idsExistentes = new Set(itemsEnCarritoMovimiento.map(i => i.id));
    const itemsUnicos = itemsNuevos.filter(i => !idsExistentes.has(i.id));
    
    setItemsEnCarritoMovimiento([...itemsEnCarritoMovimiento, ...itemsUnicos]);
    setFacturaEncontrada(factura);
    setBusquedaFactura(factura.id.toString());
    setResultadosBusquedaFactura([]);
    mostrarToast?.(`Cargados ${itemsUnicos.length} productos de la factura ${factura.id}`, "success");
  };

  const abrirModal = (tipo) => {
    setTipoMovimiento(tipo);
    setItemsEnCarritoMovimiento([]);
    setBusquedaCarrito('');
    setSubTipoDevolucion('producto');
    setItemsDevolucion([]);
    setBusquedaFactura('');
    setFacturaEncontrada(null);
    
    // Reseteamos el estado interno del formulario simple a través del hook si es necesario
    formProps.setMovimientoData({ productoId: '', cantidad: 1, almacenDestino: 'Principal', nota: '' });
    //Limpieza de los campos de ajuste para que el modal aparezca en blanco
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
          const productoOriginal = productos.find(p => p.id === item.id);
          if (productoOriginal && item.cantidadMovimiento > productoOriginal.stock) {
            throw new Error(`Stock insuficiente para ${item.nombre}. Disponible: ${productoOriginal.stock}`);
          }
        }
      }

      const payload = {
        tipo: tipo, 
        nota: `${prefijoNota} ${proveedorSeleccionado ? `(Prov: ${proveedorSeleccionado})` : ''} - ${new Date().toLocaleDateString()}`,
        items: itemsEnCarritoMovimiento.map(item => ({
          productoId: item.id,
          cantidad: Number(item.cantidadMovimiento),
          almacen: item.almacen || 'Principal',
          lote: item.lote
        })),
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

    const headers = ["Fecha", "Producto", "Código", "Usuario", "Tipo", "Cantidad", "Stock Final", "Nota"];
    const rows = movimientosFiltrados.map(m => {
      const usuarioObj = usuarios.find(u => Number(u.id) === Number(m.usuarioId));
      const nombreUsuario = usuarioObj ? usuarioObj.nombre : (m.usuarioId || 'Sistema');

      return [
        `"${new Date(m.createdAt).toLocaleString()}"`,
        `"${(m.producto?.nombre || '---').replace(/"/g, '""')}"`,
        `"${(m.producto?.codigo || '---').replace(/"/g, '""')}"`,
        `"${nombreUsuario}"`,
        `"${m.tipo}"`,
        `"${m.cantidad}"`,
        `"${m.nuevoStock ?? '---'}"`,
        `"${(m.nota || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Kardex_Inventario_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const esFlujoMovimientoMasivo = tipoMovimiento === 'multilinea' || tipoMovimiento === 'recibir' || tipoMovimiento === 'despachar';

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

        <div className="flex flex-wrap gap-2">
          <button onClick={() => abrirModal('multilinea')} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-brand transition-all active:scale-95">
            <List size={14} /> Recibo multi-línea
          </button>
          <button onClick={() => abrirModal('recibir')} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-emerald-600 transition-all active:scale-95">
            <Download size={14} /> Recibir
          </button>
          <button onClick={() => abrirModal('despachar')} className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-sky-600 transition-all active:scale-95">
            <Truck size={14} /> Despachar
          </button>
          <button onClick={() => abrirModal('transferir')} className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-indigo-600 transition-all active:scale-95">
            <ArrowLeftRight size={14} /> Transferir
          </button>
          <button onClick={() => abrirModal('ajustar')} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-amber-600 transition-all active:scale-95">
            <RefreshCw size={14} /> Ajustar
          </button>
          <button onClick={() => abrirModal('devolucion')} className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-purple-600 transition-all active:scale-95">
            <RefreshCw size={14} /> Devolución
          </button>
          <button onClick={() => abrirModal('descartar')} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-rose-600 transition-all active:scale-95">
            <Trash2 size={14} /> Descartar
          </button>
        </div>
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
                  <td className="px-6 py-3 font-bold text-slate-400 uppercase italic">
                    {usuarios.find(u => Number(u.id) === Number(mov.usuarioId))?.nombre || mov.usuarioId || 'Sistema'}
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
                  {/* Selector de Proveedor para Recibos */}
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

                  {/* Buscador de Factura opcional para vincular recibos */}
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
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 sticky top-0">
                          <tr>
                            <th className="px-6 py-4">Producto</th>
                            <th className="px-6 py-4 w-28">Almacén</th>
                            <th className="px-6 py-4 w-24">Cantidad</th>
                            {(tipoMovimiento === 'recibir' || tipoMovimiento === 'multilinea') && (
                              <th className="px-6 py-4 w-32">Lote</th>
                            )}
                            <th className="px-6 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {itemsEnCarritoMovimiento.map((item, idx) => (
                            <tr key={item.id} className="text-sm">
                              <td className="px-6 py-3 font-bold text-slate-700">
                                <p className="text-xs uppercase font-black">{item.nombre}</p>
                                <p className="text-[9px] text-slate-400 font-bold">STOCK: {item.stock}</p>
                              </td>
                              <td className="px-6 py-3">
                                <select
                                  className="w-28 p-2 border rounded-lg font-black text-[10px] uppercase bg-white"
                                  value={item.almacen || ''}
                                  onChange={(e) => {
                                    const nuevaLista = [...itemsEnCarritoMovimiento];
                                    nuevaLista[idx].almacen = e.target.value;
                                    setItemsEnCarritoMovimiento(nuevaLista);
                                  }}
                                >
                                  {(almacenesNombres.length > 0 ? almacenesNombres : ['Principal']).map(almacen => (
                                    <option key={almacen} value={almacen}>{almacen}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-3">
                                <input 
                                  type="number" min="1"
                                  max={tipoMovimiento === 'despachar' ? item.stock : undefined}
                                  className="w-20 p-2 border rounded-lg font-black text-center text-xs"
                                  value={item.cantidadMovimiento}
                                  onChange={(e) => {
                                    const nuevaLista = [...itemsEnCarritoMovimiento];
                                    nuevaLista[idx].cantidadMovimiento = parseInt(e.target.value) || 0;
                                    setItemsEnCarritoMovimiento(nuevaLista);
                                  }}
                                />
                              </td>
                              {(tipoMovimiento === 'recibir' || tipoMovimiento === 'multilinea') && (
                                <td className="px-6 py-3">
                                  <input 
                                    type="text"
                                    placeholder="Nº Lote"
                                    className="w-full p-2 border rounded-lg font-bold text-xs uppercase"
                                    value={item.lote || ''}
                                    onChange={(e) => {
                                      const nuevaLista = [...itemsEnCarritoMovimiento];
                                      nuevaLista[idx].lote = e.target.value;
                                      setItemsEnCarritoMovimiento(nuevaLista);
                                    }}
                                  />
                                </td>
                              )}
                              <td className="px-6 py-3 text-right">
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
                    disabled={itemsEnCarritoMovimiento.length === 0}
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
                          {/* Mapeo de items devueltos de factura acortado aquí para limpieza */}
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
                  productos={productos} // Productos se mantiene del contexto principal
                  almacenesDisponibles={almacenesNombres} // <-- Usamos los nombres de los almacenes del contexto
                  onSubmit={formProps.ejecutarMovimiento}
                  {...formProps}
                />
              )}

              {/* 4. MOVIMIENTOS SIMPLES DIRECTOS (Ajustar, Descartar) */}
              {(tipoMovimiento === 'descartar') && (
                <FormMovimientoSimple 
                  tipoMovimiento={tipoMovimiento}
                  productos={productos}
                  onSubmit={formProps.ejecutarMovimiento}
                  movimientoData={formProps.movimientoData}
                  setMovimientoData={formProps.setMovimientoData}
                />
              )}
              {/* 5. NUEVO: FORMULARIO DE AJUSTE AVANZADO (Con Almacén, Cantidad y Costo) */}
              {tipoMovimiento === 'ajustar' && (
                <FormAjuste 
                  productos={productos}
                  almacenesDisponibles={almacenesNombres} // Tus almacenes del contexto general
                  onSubmit={formProps.ejecutarMovimiento}
                  
                  // Mapeo explícito de los estados específicos de ajuste desde el hook
                  ajusteProductoId={formProps.ajusteProductoId}
                  setAjusteProductoId={formProps.setAjusteProductoId}
                  almacenDestino={formProps.ajusteAlmacen}       // Enlazado con ajusteAlmacen del hook
                  setAlmacenDestino={formProps.setAjusteAlmacen}  // Enlazado con setAjusteAlmacen del hook
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
