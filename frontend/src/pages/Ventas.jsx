import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Search as SearchIcon, Plus as PlusIcon, Minus as MinusIcon, 
  Trash2 as TrashIcon, User as UserIcon, ShoppingCart as CartIcon, 
  DollarSign as DollarIcon, Ticket as TicketIcon, Clock, Receipt, X, Save, Edit3,
  AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useClientes } from '../context/ClienteContext';
import { useVentas } from '../context/VentasContext';
import { useAuth } from '../context/AuthContext';
import { imprimirTicket } from '../utils/printer';

const VentaDialog = ({ dialog, onClose }) => {
  if (!dialog.open) return null;

  const isSuccess = dialog.type === 'success';
  const isWarning = dialog.type === 'warning';
  const isConfirm = dialog.type === 'confirm';
  const Icon = isSuccess ? CheckCircle2 : AlertTriangle;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 pt-8 pb-5 text-center">
          <div className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center ${
            isSuccess ? 'bg-emerald-50 text-emerald-500' : isWarning ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-brand'
          }`}>
            {dialog.loading ? <Loader2 size={32} className="animate-spin" /> : <Icon size={34} />}
          </div>
          <h3 className="mt-5 text-xl font-black text-slate-800 uppercase italic tracking-tight">{dialog.title}</h3>
          <p className="mt-2 text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-wide">{dialog.message}</p>
          {dialog.total && (
            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4">
              <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Total a cobrar</span>
              <strong className="block mt-1 text-3xl font-black text-slate-900 tracking-tight">RD$ {dialog.total}</strong>
            </div>
          )}
        </div>

        <div className="flex border-t border-slate-100">
          {isConfirm && (
            <button
              type="button"
              onClick={onClose}
              disabled={dialog.loading}
              className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-colors border-r border-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={isConfirm ? dialog.onConfirm : onClose}
            disabled={dialog.loading}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors disabled:opacity-70 ${
              isSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : isWarning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand hover:bg-indigo-700'
            }`}
          >
            {dialog.loading ? 'Procesando' : isConfirm ? 'Procesar' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Ventas = () => {
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [resultadosClientes, setResultadosClientes] = useState([]);
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);

  /// --- CONTEXTOS ---
  const { registrarVenta } = useVentas();
  const { productos, descontarStock, setVerEliminados } = useInventario();
  const { clientes } = useClientes();
  const { usuario } = useAuth();
  
  // Load company data from local storage
  const companyData = useMemo(() => {
    try {
      const savedConfig = localStorage.getItem('posfactura_config');
      return savedConfig ? JSON.parse(savedConfig) : { 
        nombre: 'Mi Negocio S.A.', 
        rnc: '',
        telefono: '',
        direccion: '',
        mensaje: '¡Gracias por su compra!' 
      };
    } catch (e) {
      console.error("Error loading company data from local storage:", e);
      return {}; // Return empty object or default values if parsing fails
    }
  }, []);
  
  // Cargar el tamaño del papel configurado
  const papelSize = useMemo(() => {
    return localStorage.getItem('posfactura_papel') || '80mm';
  }, []);

  // --- ESTADOS PRINCIPALES ---
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [showAbiertasModal, setShowAbiertasModal] = useState(false);
  const [ventaDialog, setVentaDialog] = useState({ open: false });
  const inputBusquedaRef = useRef(null);

  // Ref para rastrear si el componente está montado
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // --- ESTADOS PARA DESCUENTOS ---
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [showDescuentoModal, setShowDescuentoModal] = useState(false);
  const [tempDescuento, setTempDescuento] = useState("");

  // --- CONFIGURACIÓN Y TIEMPO ---
  const itbisGlobal = Number(localStorage.getItem('posfactura_itbis')) || 18;
  const [fechaHora, setFechaHora] = useState(new Date());

  // Al entrar a la pantalla de ventas, forzamos al contexto a ignorar eliminados
  // por si el usuario venía de la sección de inventario con filtros aplicados.
  useEffect(() => {
    if (setVerEliminados) setVerEliminados(false);
  }, [setVerEliminados]);

  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- LÓGICA DE CÁLCULO ---
  const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const montoDescuento = subtotal * (descuentoPorcentaje / 100);
  const subtotalConDescuento = subtotal - montoDescuento;
  const impuesto = subtotalConDescuento * (itbisGlobal / 100);
  const totalFinal = subtotalConDescuento + impuesto;
  const formatoMoneda = useCallback((valor) => (
    Number(valor).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  ), []);

  const cerrarVentaDialog = useCallback(() => {
    if (mountedRef.current) { // Solo actualizar si el componente sigue montado
      setVentaDialog({ open: false });
    }
  }, []);

  // --- VALIDACIÓN DE PERMISOS PARA DESCUENTO ---
  const aplicarDescuentoSeguro = () => {
    const valor = parseFloat(tempDescuento) || 0;
    let limite = 0;

    if (usuario?.rol === 'admin') limite = 100;
    else if (usuario?.rol === 'supervisor') limite = 25;
    else limite = 5; 

    if (valor > limite) {
      alert(`⚠️ Tu rol (${usuario?.rol}) solo permite hasta el ${limite}%.\nSolicita autorización.`);
      return;
    }

    setDescuentoPorcentaje(valor);
    setShowDescuentoModal(false);
  };

  const procesarVenta = useCallback(async () => {
    if (!mountedRef.current) return; // Evitar cualquier operación si el componente ya no está montado

    setVentaDialog(prev => ({ ...prev, loading: true })); // Inicia el estado de carga
    try {
      const clienteActual = clientes.find(c => c.id.toString() === clienteId.toString()) || { nombre: "Consumidor Final", rnc: "" };

      const nuevaVenta = {
        cliente: clienteActual.nombre,
        rnc: clienteActual.rnc || "",
        subtotal: Number(subtotal),
        descuento: Number(montoDescuento),
        itbis: Number(impuesto),
        total: Number(totalFinal),
        items: carrito.map(item => ({
          productoId: Number(item.id),
          cantidad: Number(item.cantidad),
          precio: Number(item.precio)
        })),
        vendedorId: usuario?.id?.toString(),
      };

      const resVenta = await registrarVenta(nuevaVenta);

      if (resVenta && resVenta.success === false) {
        if (!mountedRef.current) return; // Evitar actualizaciones si el componente se desmontó durante la espera
        throw new Error(resVenta.error || "Error al registrar la venta en el servidor.");
      }

      let stockWarning = null;

      try {
        await descontarStock(carrito);
      } catch (stockError) {
        console.error("Error al descontar stock:", stockError);
        if (!mountedRef.current) return; // Evitar actualizaciones si el componente se desmontó durante la espera
        stockWarning = stockError.message;
      }

      // Usamos el objeto devuelto por el servidor (resVenta.venta) para imprimir, 
      // ya que este contiene el ID real y la fecha generada por la DB.
      imprimirTicket(resVenta.venta, carrito, companyData, papelSize);

      setCarrito([]);
      setDescuentoPorcentaje(0);
      setBusquedaCliente("");

      const consumidor = clientes.find(c => c.nombre.toUpperCase().includes("CONSUMIDOR"));
      if (consumidor) {
        setClienteId(consumidor.id.toString());
      }

      setTimeout(() => {
        if (mountedRef.current) { // Solo enfocar si el componente sigue montado
          inputBusquedaRef.current?.focus();
        }
      }, 100);

      if (stockWarning) {
        if (mountedRef.current) { // Solo actualizar si el componente sigue montado
          setVentaDialog({
            open: true,
            type: 'warning',
            title: 'Venta registrada',
            message: `El ticket fue generado, pero hubo un problema al descontar stock: ${stockWarning}`,
          });
        }
      } else {
        if (mountedRef.current) { // Solo actualizar si el componente sigue montado
          setVentaDialog({
            open: true,
            type: 'success',
            title: 'Venta completada',
            message: `La factura de ${clienteActual.nombre} fue registrada e impresa correctamente.`,
            total: formatoMoneda(totalFinal),
          });
        }
      }
    } catch (error) {
      console.error("Error en flujo de venta:", error);
      setVentaDialog({
        open: true,
        type: 'warning',
        title: 'No se pudo completar',
        message: error.message || 'Ocurrió un error al registrar la venta.',
      });
    }
  }, [carrito, totalFinal, clienteId, clientes, usuario, subtotal, montoDescuento, impuesto, registrarVenta, descontarStock, formatoMoneda, companyData, mountedRef, papelSize]);

  const finalizarVenta = useCallback(async () => {
    if (carrito.length === 0) {
      setVentaDialog({
        open: true,
        type: 'warning',
        title: 'Carrito vacío',
        message: 'Agrega al menos un producto antes de finalizar la venta.',
      });
      return;
    }

    setVentaDialog({
      open: true,
      type: 'confirm',
      title: 'Confirmar venta',
      message: 'Revisa el total antes de procesar e imprimir el ticket.',
      total: formatoMoneda(totalFinal),
      onConfirm: procesarVenta,
    });
  }, [carrito.length, totalFinal, formatoMoneda, procesarVenta]);

  useEffect(() => {
    const manejarTeclado = (e) => {
      if (e.key === 'F10') {
        e.preventDefault();
        finalizarVenta();
      }
      if (e.key === 'F2') {
        e.preventDefault();
        inputBusquedaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', manejarTeclado);
    return () => window.removeEventListener('keydown', manejarTeclado);
  }, [finalizarVenta]);

  // --- FILTRADO DE CLIENTES ---
  useEffect(() => {
    if (!busquedaCliente.trim()) {
      setResultadosClientes([]);
      return;
    }
    const filtrados = clientes.filter(c => 
      c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) || 
      (c.rnc && c.rnc.includes(busquedaCliente))
    );
    setResultadosClientes(filtrados);
  }, [busquedaCliente, clientes]);

  // --- INICIALIZAR CLIENTE ---
  useEffect(() => {
    if (clientes?.length > 0 && !clienteId) {
      const consumidor = clientes.find(c => c.nombre.toLowerCase().includes("consumidor"));
      setClienteId(consumidor ? consumidor.id.toString() : clientes[0].id.toString());
    }
  }, [clientes, clienteId]);

  // --- MANEJO DE FACTURAS PAUSADAS ---
  const [facturasAbiertas, setFacturasAbiertas] = useState(() => {
    const saved = localStorage.getItem('posfactura_abiertas');
    const data = saved ? JSON.parse(saved) : [];
    const esRangoAlto = usuario?.rol === 'admin' || usuario?.rol === 'supervisor';
    return esRangoAlto ? data : data.filter(f => f.vendedorId === usuario?.id);
  });

  useEffect(() => {
    localStorage.setItem('posfactura_abiertas', JSON.stringify(facturasAbiertas));
  }, [facturasAbiertas]);

  // --- BUSCADOR ---
  useEffect(() => {
    if (!busqueda.trim()) return setResultados([]);
    const filtrados = productos.filter(p => 
      p.isActive !== false && (
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(busqueda.toLowerCase())) ||
        (p.codigo && p.codigo.toLowerCase().includes(busqueda.toLowerCase()))
      )
    );
    setResultados(filtrados);
  }, [busqueda, productos]);

  const handleAgregar = (producto) => {
    const itemExistente = carrito.find(i => i.id === producto.id);
    const cantActual = itemExistente ? itemExistente.cantidad : 0;
    if (producto.stock <= cantActual) return alert("Stock insuficiente");

    setCarrito(prev => {
      if (itemExistente) return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      return [...prev, { ...producto, className: 'item-carrito', cantidad: 1 }];
    });
    setBusqueda("");
    setResultados([]);
    inputBusquedaRef.current?.focus();
  };

  const guardarEnAbiertas = () => {
    if (carrito.length === 0) return;
    const clienteSeleccionado = clientes.find(c => c.id.toString() === clienteId.toString());
    const nuevaAbierta = {
      id: Date.now(),
      cliente: clienteSeleccionado?.nombre || "Consumidor Final",
      clienteId,
      items: [...carrito],
      descuento: descuentoPorcentaje, 
      total: totalFinal,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vendedorId: usuario?.id,
      vendedorNombre: usuario?.nombre
    };
    setFacturasAbiertas([...facturasAbiertas, nuevaAbierta]);
    setCarrito([]);
    setDescuentoPorcentaje(0);
    inputBusquedaRef.current?.focus();
  };

  const recuperarFactura = (factura) => {
    setCarrito(factura.items);
    setClienteId(factura.clienteId.toString());
    setDescuentoPorcentaje(factura.descuento || 0);
    setFacturasAbiertas(facturasAbiertas.filter(f => f.id !== factura.id));
    setShowAbiertasModal(false);
  };

  const esRangoAlto = usuario?.rol === 'admin' || usuario?.rol === 'supervisor';
  const formatoFecha = fechaHora.toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatoHora = fechaHora.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="h-full flex flex-col gap-3 p-1 md:p-4 overflow-y-auto md:overflow-hidden">
      
      {/* HEADER POS (Mejorado para colapsar limpio en móviles) */}
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm gap-3 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-base md:text-xl font-black text-slate-800 tracking-tight uppercase italic">Tech2Solution POS</h1>
          <div className="flex flex-wrap items-center gap-2 text-slate-500 mt-1">
            <span className="text-brand font-black text-[9px] px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-100 uppercase italic">
              Cajero: {usuario?.nombre} {esRangoAlto && `(${usuario?.rol.toUpperCase()})`}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-tight">{formatoFecha} | {formatoHora}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowAbiertasModal(true)} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl font-black text-[10px] uppercase hover:bg-amber-100 transition-all">
            <Receipt size={14} /> <span>Abiertas ({facturasAbiertas.length})</span>
          </button>
          <button onClick={guardarEnAbiertas} disabled={carrito.length === 0} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-brand border border-indigo-100 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-100 transition-all disabled:opacity-50">
            <Save size={14} /> <span>Pausar</span>
          </button>

          <div className="relative w-full sm:w-64 mt-1 sm:mt-0">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 shadow-inner">
              <UserIcon size={14} className={clienteId ? "text-brand" : "text-slate-300"} />
              <input 
                type="text"
                className="bg-transparent outline-none text-[11px] font-black uppercase text-slate-700 w-full placeholder:text-slate-300"
                placeholder="Cliente / RNC..."
                value={busquedaCliente}
                onChange={(e) => {
                  setBusquedaCliente(e.target.value);
                  setMostrarListaClientes(true);
                }}
                onFocus={() => setMostrarListaClientes(true)}
              />
              {clienteId && (
                <button onClick={() => { setClienteId(""); setBusquedaCliente(""); }} className="text-slate-300 hover:text-red-500">
                  <X size={14} />
                </button>
              )}
            </div>

            {mostrarListaClientes && resultadosClientes.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl z-[120] max-h-48 overflow-y-auto p-2">
                {resultadosClientes.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => {
                      setClienteId(c.id.toString());
                      setBusquedaCliente(c.nombre);
                      setMostrarListaClientes(false);
                    }}
                    className="flex flex-col px-3 py-2 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                  >
                    <span className="text-[10px] font-black text-slate-700 uppercase">{c.nombre}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">RNC: {c.rnc || '---'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CUERPO POS (Cambiado a flex-col en móviles para dar espacio vertical real) */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        
        {/* PANEL IZQUIERDO: BUSCADOR Y LISTA DEL CARRITO */}
        <div className="flex flex-col md:col-span-7 lg:col-span-8 min-h-[320px] md:min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* BUSCADOR DE PRODUCTOS (Asegurado con z-index y padding consistente) */}
          <div className="p-3 border-b border-slate-100 bg-white relative z-30 shrink-0">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                ref={inputBusquedaRef} 
                autoFocus 
                type="text" 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
                placeholder="Buscar producto por nombre o SKU..." 
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-brand outline-none text-xs font-medium bg-slate-50/50" 
              />
            </div>
            
            {/* Resultados del Buscador */}
            {resultados.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-white border border-slate-200 shadow-2xl rounded-xl max-h-48 overflow-y-auto p-1.5">
                {resultados.map(prod => (
                  <div key={prod.id} onClick={() => { handleAgregar(prod); setBusqueda(""); }} className="flex justify-between items-center gap-2 px-3 py-2.5 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors border-b border-slate-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-700 text-xs uppercase block truncate">{prod.nombre}</span>
                      <span className="block text-[9px] font-black text-slate-400">STOCK: {prod.stock}</span>
                    </div>
                    <span className="font-black text-brand text-xs whitespace-nowrap">RD$ {prod.precio.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TABLA DEL CARRITO (Scroll interno protegido) */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-100 font-black uppercase text-[9px] text-slate-400 tracking-widest italic z-10">
                <tr>
                  <th className="px-4 py-2.5">Producto</th>
                  <th className="px-2 py-2.5 text-center">Cant.</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {carrito.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center opacity-25">
                      <CartIcon size={32} className="mx-auto mb-1.5 text-slate-400" />
                      <p className="text-[9px] uppercase font-black tracking-widest">Carrito Vacío</p>
                    </td>
                  </tr>
                ) : (
                  carrito.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2.5 uppercase text-slate-700 max-w-[140px] truncate">{item.nombre}</td>
                      <td className="px-2 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setCarrito(prev => prev.map(i => i.id === item.id ? {...i, cantidad: Math.max(1, i.cantidad - 1)} : i))} className="p-1 rounded-md bg-slate-100 hover:bg-slate-200"><MinusIcon size={10}/></button>
                          <span className="w-5 text-center font-black text-[11px]">{item.cantidad}</span>
                          <button onClick={() => handleAgregar(item)} className="p-1 rounded-md bg-slate-100 hover:bg-slate-200"><PlusIcon size={10}/></button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-black italic text-slate-800">RD$ {(item.precio * item.cantidad).toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right">
                        <button onClick={() => setCarrito(carrito.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500 transition-colors"><TrashIcon size={14}/></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL DERECHO: TOTALES Y PAGO */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col shrink-0">
          <div className="bg-white p-4 md:p-5 rounded-[1.5rem] border border-slate-200 shadow-md flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-100 pb-2 font-black uppercase text-[9px] tracking-widest italic text-slate-600">
                <h2>Detalle de Cobro</h2>
                <TicketIcon size={14} className="text-brand" />
              </div>
              
              <div className="space-y-2 text-xs font-black uppercase">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px]">Subtotal Bruto</span>
                  <span className="text-slate-800">RD$ {subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center cursor-pointer group" onClick={() => setShowDescuentoModal(true)}>
                  <span className="text-[9px] text-slate-400 group-hover:text-brand flex items-center gap-1 transition-colors">
                    Descuento ({descuentoPorcentaje}%) <Edit3 size={10}/>
                  </span>
                  <span className="text-rose-500 font-black">
                    {descuentoPorcentaje > 0 && `- `} RD$ {montoDescuento.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px]">ITBIS ({itbisGlobal}%)</span>
                  <span className="text-slate-800">RD$ {impuesto.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-slate-200 text-center uppercase">
                <p className="text-[9px] font-black text-slate-400 mb-0.5 tracking-widest">Total a Pagar</p>
                <div className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter italic">
                  <span className="text-xs align-top mr-0.5 font-bold text-slate-400">RD$</span>
                  {totalFinal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <button 
              onClick={finalizarVenta} 
              disabled={carrito.length === 0} 
              className={`w-full py-4 rounded-xl font-black text-xs shadow-md transition-all uppercase flex flex-col items-center justify-center ${
                carrito.length > 0 ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarIcon size={16} /> 
                <span>Finalizar Factura</span>
              </div>
              <span className="text-[8px] opacity-70 mt-0.5">[ Presione F10 ]</span>
            </button>
          </div>
        </div>

      </div>

      {/* --- MODALES SE MANTIENEN IDÉNTICOS --- */}
      {showDescuentoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xs overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black uppercase text-xs tracking-widest italic">Aplicar Descuento</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Rol: {usuario?.role || usuario?.rol}</p>
              </div>
              <button onClick={() => setShowDescuentoModal(false)}><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="relative mb-4">
                <input type="number" autoFocus value={tempDescuento} onChange={(e) => setTempDescuento(e.target.value)} placeholder="0" className="w-full text-4xl font-black text-center outline-none text-slate-800" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">%</span>
              </div>
              <button onClick={aplicarDescuentoSeguro} className="w-full bg-brand text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md hover:bg-indigo-600 transition-all">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showAbiertasModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center font-black uppercase text-xs italic tracking-widest">
              <h3>Facturas en Espera</h3>
              <button onClick={() => setShowAbiertasModal(false)}><X size={20} /></button>
            </div>
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {facturasAbiertas.length === 0 ? (
                <p className="text-center text-[10px] text-slate-400 uppercase py-6 font-bold">No hay facturas pausadas</p>
              ) : (
                facturasAbiertas.map(f => (
                  <div key={f.id} onClick={() => recuperarFactura(f)} className="p-3 border border-slate-100 rounded-xl hover:border-brand hover:bg-slate-50 cursor-pointer flex justify-between items-center group transition-all">
                    <div>
                      <p className="text-slate-800 font-black text-xs uppercase group-hover:text-brand transition-colors">{f.cliente}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{f.hora} {esRangoAlto && `• ${f.vendedorNombre}`}</p>
                    </div>
                    <p className="text-brand font-black italic text-xs">RD$ {f.total.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <VentaDialog dialog={ventaDialog} onClose={cerrarVentaDialog} />

    </div>
  );
};

export default Ventas;
