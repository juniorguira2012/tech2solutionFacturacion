import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeftRight, List, Download, Truck, 
  RefreshCw, Trash2, Search, X, Plus, 
  CheckCircle, AlertCircle, Package
} from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';
import { useVentas } from '../../context/VentasContext';
import { useAuth } from '../../context/AuthContext';

const MovimientosSection = ({ mostrarToast }) => {
  const { 
    productos, 
    movimientos, 
    registrarMovimiento,
    registrarMovimientosMasivos,
    cargarMovimientos, 
    loading,
    recargarInventario 
  } = useInventario();
  const { historialVentas } = useVentas();
  const { usuario } = useAuth();
  
  // Estados para el manejo de acciones
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState(null); // 'recibir', 'despachar', 'transferir', 'ajustar', 'descartar', 'multilinea', 'devolucion'
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busquedaKardex, setBusquedaKardex] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  // Estado para el formulario de movimiento simple
  const [movimientoData, setMovimientoData] = useState({
    productoId: '',
    cantidad: 1,
    almacenDestino: 'Principal',
    nota: ''
  });

  // Estado del "Carrito de Recibo" (Compartido por Multilinea y Recibir)
  const [itemsEnCarritoMovimiento, setItemsEnCarritoMovimiento] = useState([]);
  const [busquedaCarrito, setBusquedaCarrito] = useState('');
  const [resultadosBusquedaCarrito, setResultadosBusquedaCarrito] = useState([]);

  // Estados para el "Carrito de Devolución"
const [itemsARecibir, setItemsARecibir] = useState([]);

  // Estados específicos para Devolución
  const [subTipoDevolucion, setSubTipoDevolucion] = useState('producto'); 
  const [busquedaFactura, setBusquedaFactura] = useState('');
  const [facturaEncontrada, setFacturaEncontrada] = useState(null);
  const [itemsDevolucion, setItemsDevolucion] = useState([]);

  // Lógica de búsqueda para el carrito de recibo
  useEffect(() => { // Renombrado de busquedaRecibo a busquedaCarrito
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

  // Cargar historial al montar el componente
  useEffect(() => {
    cargarMovimientos();
  }, []);

  // Función para añadir al carrito de movimiento (recibir o despachar)
  const agregarAlCarritoMovimiento = (producto) => {
    const existe = itemsEnCarritoMovimiento.find(item => item.id === producto.id);
    if (existe) {
      mostrarToast?.("El producto ya está en la lista", "warning");
      return;
    }

    // Validar stock para despacho
    if (tipoMovimiento === 'despachar' && producto.stock <= 0) {
      mostrarToast?.(`No hay stock disponible para ${producto.nombre}`, "error");
      return;
    }

    setItemsEnCarritoMovimiento([...itemsEnCarritoMovimiento, { 
      ...producto, 
      cantidadMovimiento: 1, // Cantidad a recibir o despachar
      almacen: producto.almacen || 'Principal', // Valor por defecto
      // Si es despacho, la cantidad inicial no debe exceder el stock
      // Si es recibo, puede ser 1
      cantidadMovimiento: tipoMovimiento === 'despachar' ? Math.min(1, producto.stock) : 1,
    }]);
    setBusquedaCarrito('');
    setResultadosBusquedaCarrito([]);
  };

  const abrirModal = (tipo) => {
    setTipoMovimiento(tipo);
    setMovimientoData({ productoId: '', cantidad: 1, almacenDestino: 'Principal', nota: '' });
    setItemsEnCarritoMovimiento([]);
    setBusquedaCarrito('');
    setSubTipoDevolucion('producto');
    setBusquedaFactura('');
    setFacturaEncontrada(null);
    setModalOpen(true);
  };

  const cerrarModal = () => { // Limpia el carrito genérico
    setModalOpen(false);
    setTipoMovimiento(null);
    setItemsEnCarritoMovimiento([]);
    setBusquedaCarrito('');
    setResultadosBusquedaCarrito([]);
  };

  const ejecutarMovimiento = async (e) => {
    e.preventDefault();
    
    const prod = productos.find(p => p.id === Number(movimientoData.productoId));
    if (!prod) return mostrarToast?.('Selecciona un producto válido', 'error');

    const exito = await registrarMovimiento({
      productoId: prod.id,
      tipo: tipoMovimiento.toUpperCase(),
      cantidad: Number(movimientoData.cantidad),
      almacenDestino: movimientoData.almacenDestino,
      nota: movimientoData.nota
    });

    if (exito) {
      mostrarToast?.(`Movimiento de ${tipoMovimiento} completado`, 'success');
      cerrarModal();
    }
  };

  const procesarMovimientoMasivo = async () => { // Renombrado de procesarReciboMasivo
    if (itemsEnCarritoMovimiento.length === 0) return;
    
    try {
      const tipo = tipoMovimiento === 'despachar' ? 'DESPACHAR' : 'RECIBIR';
      const prefijoNota = tipo === 'RECIBIR' ? 'Recibo de Inventario' : 'Despacho de Inventario';

      // Validaciones adicionales para despacho
      if (tipo === 'DESPACHAR') {
        for (const item of itemsEnCarritoMovimiento) {
          const productoOriginal = productos.find(p => p.id === item.id);
          if (productoOriginal && item.cantidadMovimiento > productoOriginal.stock) {
            throw new Error(`Stock insuficiente para ${item.nombre}. Disponible: ${productoOriginal.stock}, Solicitado: ${item.cantidadMovimiento}`);
          }
        }
      }

      const payload = {
        tipo: tipo, 
        nota: `${prefijoNota} - ${new Date().toLocaleDateString()}`,
        items: itemsEnCarritoMovimiento.map(item => ({
          productoId: item.id,
          cantidad: Number(item.cantidadMovimiento),
          almacen: item.almacen || 'Principal'
        })),
        usuarioId: Number(usuario?.id)
      };

      const exito = await registrarMovimientosMasivos(payload); 

      if (exito) { // El contexto ahora devuelve true si todo fue bien
        mostrarToast?.("Todo el inventario ha sido recibido correctamente", "success");
        setItemsEnCarritoMovimiento([]); 
        cerrarModal();
        recargarInventario();
      }
    } catch (error) {
      console.error("Error en flujo de recibo masivo:", error);
      mostrarToast?.("Error crítico: No se pudo procesar el ingreso", "error");
    }
  };

  const buscarFactura = () => {
    const factura = historialVentas.find(v => v.id === busquedaFactura.trim());
    if (!factura) {
      mostrarToast?.('Factura no encontrada', 'error');
      setFacturaEncontrada(null);
      return;
    }
    setFacturaEncontrada(factura);
    const items = factura.items.map(item => {
      const p = productos.find(prod => prod.id === item.productoId);
      return {
        ...item,
        nombre: p?.nombre || 'Producto desconocido',
        cantidadADevolver: item.cantidad
      };
    });
    setItemsDevolucion(items);
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

  // Evaluador para determinar si renderizamos la UI masiva de recibo
  const esFlujoMovimientoMasivo = tipoMovimiento === 'multilinea' || tipoMovimiento === 'recibir' || tipoMovimiento === 'despachar';

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
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

      {/* Filtros e Historial del Kardex */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative lg:w-94"> {/* Se cambió de flex-1 a lg:w-64 para un ancho fijo en pantallas grandes */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={busquedaKardex}
            onChange={(e) => setBusquedaKardex(e.target.value)}
            placeholder="Buscar producto por nombre o código..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white shadow-sm transition-all"
          />
        </div>

        {/* RANGO DE FECHAS */}
        <div className="flex items-center gap-2 bg-white px-4 rounded-xl border border-slate-200 shadow-sm h-11">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-slate-400 italic">Desde</span>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)}
              className="outline-none text-[10px] font-bold text-slate-600 bg-transparent cursor-pointer"
            />
          </div>
          <div className="w-[1px] h-4 bg-slate-100 mx-1"></div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-slate-400 italic">Hasta</span>
            <input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)}
              className="outline-none text-[10px] font-bold text-slate-600 bg-transparent cursor-pointer"
            />
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
          className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-black text-[10px] uppercase text-slate-600 bg-white shadow-sm cursor-pointer lg:w-54">
          <option value="todos">Todos los movimientos</option>
          <option value="RECIBIR">Recibos</option>
          <option value="DESPACHAR">Despachos</option>
          <option value="TRANSFERIR">Transferencias</option>
          <option value="AJUSTAR">Ajustes</option>
          <option value="DEVOLUCION">Devoluciones</option>
          <option value="DESCARTAR">Descartes</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {movimientosFiltrados.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b text-[9px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Producto</th>
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
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-white ${
                      mov.tipo.includes('RECIBIR') || mov.tipo.includes('DEVOLUCION') ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}>
                      {mov.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center font-black">{mov.cantidad}</td>
                  <td className="px-6 py-3 text-right font-black text-brand">{mov.nuevoStock ?? '---'}</td>
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

      {/* Modal único controlado */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
                  <ArrowLeftRight size={20} />
                </div>
                <h2 className="text-lg font-black text-slate-800 uppercase italic">
                  {tipoMovimiento === 'multilinea' ? 'Recibo Multi-línea' : tipoMovimiento === 'recibir' ? 'Recibir Inventario' : `${tipoMovimiento}`}
                </h2>
              </div>
              <button onClick={cerrarModal} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white shadow-sm transition-all text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {esFlujoMovimientoMasivo ? (
                /* INTERFAZ COMPARTIDA PARA RECIBIR Y DESPACHAR */
                <div className="space-y-4 relative">
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
                          <div 
                            key={prod.id} 
                            onClick={() => agregarAlCarritoMovimiento(prod)}
                            className="flex justify-between items-center px-4 py-2 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors"
                          >
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
                            <th className="px-6 py-4">Producto (Stock Actual)</th>
                            <th className="px-6 py-4 w-32">{tipoMovimiento === 'despachar' ? 'Cant. a Despachar' : 'Cant. a Recibir'}</th>
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
                                <input 
                                  type="number"
                                  min={tipoMovimiento === 'despachar' ? "0" : "1"}
                                  max={tipoMovimiento === 'despachar' ? item.stock.toString() : undefined}
                                  className="w-20 p-2 border rounded-lg font-black text-center text-xs"
                                  value={item.cantidadMovimiento}
                                  onChange={(e) => {
                                    const nuevaLista = [...itemsEnCarritoMovimiento];
                                    nuevaLista[idx].cantidadMovimiento = parseInt(e.target.value) || 0;
                                    setItemsEnCarritoMovimiento(nuevaLista);
                                  }}
                                />
                              </td>
                              <td className="px-6 py-3 text-right">
                                <button
                                  onClick={() => setItemsEnCarritoMovimiento(itemsEnCarritoMovimiento.filter(i => i.id !== item.id))}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  <X size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {itemsEnCarritoMovimiento.length === 0 && <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase">Lista de movimiento vacía</p>}
                  </div>

                  <button 
                    disabled={itemsEnCarritoMovimiento.length === 0}
                    onClick={procesarMovimientoMasivo}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 transition-colors ${
                      tipoMovimiento === 'despachar' ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {tipoMovimiento === 'despachar' ? 'Confirmar Despacho de Inventario' : 'Procesar Entrada de Inventario'}
                  </button>
                </div>
              ) : tipoMovimiento === 'devolucion' ? (
                /* ... Formulario Devolución queda idéntico ... */
                <div className="space-y-6">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setSubTipoDevolucion('producto')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${subTipoDevolucion === 'producto' ? 'bg-white text-brand shadow-sm' : 'text-slate-400'}`}>Por Producto</button>
                    <button type="button" onClick={() => setSubTipoDevolucion('factura')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${subTipoDevolucion === 'factura' ? 'bg-white text-brand shadow-sm' : 'text-slate-400'}`}>Por Factura</button>
                  </div>
                  {subTipoDevolucion === 'producto' ? (
                    <form onSubmit={ejecutarMovimiento} className="space-y-5">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Producto</label>
                        <select required className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white" value={movimientoData.productoId} onChange={(e) => setMovimientoData({...movimientoData, productoId: e.target.value})}>
                          <option value="">Seleccionar Producto...</option>
                          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cantidad a Devolver</label>
                        <input type="number" required min="1" className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold" value={movimientoData.cantidad} onChange={(e) => setMovimientoData({...movimientoData, cantidad: e.target.value})} />
                      </div>
                      <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Procesar Devolución</button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input type="text" placeholder="Número de Factura (ej: V-16...)" className="flex-1 h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold" value={busquedaFactura} onChange={(e) => setBusquedaFactura(e.target.value)} />
                        <button onClick={buscarFactura} className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Buscar</button>
                      </div>
                      {facturaEncontrada && (
                        <div className="space-y-4">
                          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                            <p className="text-[9px] font-black text-brand uppercase">Factura: {facturaEncontrada.id}</p>
                            <p className="text-[11px] font-bold text-slate-700">{facturaEncontrada.cliente}</p>
                          </div>
                          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                            {itemsDevolucion.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border shadow-sm">
                                <div className="flex flex-col flex-1 min-w-0 pr-2">
                                  <span className="text-[10px] font-black text-slate-800 uppercase truncate">{item.nombre}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Comprado: {item.cantidad}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-[8px] font-black text-slate-400 uppercase">Devolver:</label>
                                  <input type="number" min="0" max={item.cantidad} className="w-16 h-8 px-2 rounded-lg border border-slate-200 text-xs font-bold text-center" value={item.cantidadADevolver} onChange={(e) => {
                                    const val = Math.min(item.cantidad, Math.max(0, parseInt(e.target.value) || 0));
                                    const nuevosItems = [...itemsDevolucion];
                                    nuevosItems[idx].cantidadADevolver = val;
                                    setItemsDevolucion(nuevosItems);
                                  }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          <button onClick={procesarDevolucionFactura} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Confirmar Devolución</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Formulario Movimiento Simple para Despachar, Transferir, Ajustar y Descartar */
                <form onSubmit={ejecutarMovimiento} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Producto</label>
                    <select 
                      required
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white"
                      value={movimientoData.productoId}
                      onChange={(e) => setMovimientoData({...movimientoData, productoId: e.target.value})}
                    >
                      <option value="">Seleccionar Producto...</option>
                      {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock actual: {p.stock})</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        {tipoMovimiento === 'ajustar' ? 'Nuevo Stock Real' : 'Cantidad'}
                      </label>
                      <input 
                        type="number" 
                        required
                        幕in="1"
                        className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold"
                        value={movimientoData.cantidad}
                        onChange={(e) => setMovimientoData({...movimientoData, cantidad: e.target.value})}
                      />
                    </div>
                    {tipoMovimiento === 'transferir' && (
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Almacén Destino</label>
                        <select 
                          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white"
                          value={movimientoData.almacenDestino}
                          onChange={(e) => setMovimientoData({...movimientoData, almacenDestino: e.target.value})}
                        >
                          {['Principal', 'Secundario', 'Temporal', 'Externo'].map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nota / Observación</label>
                    <input 
                      type="text"
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold"
                      placeholder="Escribe el motivo del movimiento..."
                      value={movimientoData.nota}
                      onChange={(e) => setMovimientoData({...movimientoData, nota: e.target.value})}
                    />
                  </div>

                  <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand transition-all">
                    Confirmar {tipoMovimiento}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovimientosSection;