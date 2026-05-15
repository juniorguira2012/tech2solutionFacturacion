import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Search as SearchIcon, Plus as PlusIcon, Minus as MinusIcon, 
  Trash2 as TrashIcon, User as UserIcon, ShoppingCart as CartIcon, 
  DollarSign as DollarIcon, Ticket as TicketIcon, Clock, Receipt, X, Save, Edit3
} from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useClientes } from '../context/ClienteContext';
import { useVentas } from '../context/VentasContext';
import { useAuth } from '../context/AuthContext';
import { imprimirTicket } from '../utils/printer';

const Ventas = () => {
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [resultadosClientes, setResultadosClientes] = useState([]);
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);

  /// --- CONTEXTOS ---
  const { registrarVenta } = useVentas();
  const { productos, descontarStock } = useInventario();
  const { clientes } = useClientes();
  const { usuario } = useAuth();

  // --- ESTADOS PRINCIPALES ---
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [showAbiertasModal, setShowAbiertasModal] = useState(false);
  const inputBusquedaRef = useRef(null);

  // --- ESTADOS PARA DESCUENTOS ---
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [showDescuentoModal, setShowDescuentoModal] = useState(false);
  const [tempDescuento, setTempDescuento] = useState("");

  // --- CONFIGURACIÓN Y TIEMPO ---
  const itbisGlobal = Number(localStorage.getItem('posfactura_itbis')) || 18;
  const [fechaHora, setFechaHora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- LÓGICA DE CÁLCULO (CORREGIDA) ---
  // 2. Cálculos actualizados
  const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const montoDescuento = subtotal * (descuentoPorcentaje / 100);
  const subtotalConDescuento = subtotal - montoDescuento;
  const impuesto = subtotalConDescuento * (itbisGlobal / 100);
  const totalFinal = subtotalConDescuento + impuesto;

  // --- VALIDACIÓN DE PERMISOS PARA DESCUENTO ---
  const aplicarDescuentoSeguro = () => {
    const valor = parseFloat(tempDescuento) || 0;
    let limite = 0;

    if (usuario?.rol === 'admin') limite = 100;
    else if (usuario?.rol === 'supervisor') limite = 25;
    else limite = 5; // Cajeros

    if (valor > limite) {
      alert(`⚠️ Tu rol (${usuario?.rol}) solo permite hasta el ${limite}%.\nSolicita autorización.`);
      return;
    }

    setDescuentoPorcentaje(valor);
    setShowDescuentoModal(false);
  };

  const finalizarVenta = useCallback(async () => {
  // 1. Validaciones iniciales
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  // 2. Confirmación visual con el monto exacto
  const confirmacion = window.confirm(
    `RESUMEN DE VENTA\n` +
    `--------------------------\n` +
    `Total a cobrar: RD$ ${totalFinal.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n\n` +
    `¿Desea procesar e imprimir el ticket?`
  );

  if (!confirmacion) return;

  try {
    // 3. Preparar datos dinámicos desde configuración
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

    // 4. Ejecutar operaciones críticas - primero registrar la venta
    const resVenta = await registrarVenta(nuevaVenta);

    if (resVenta && resVenta.success === false) {
      throw new Error(resVenta.error || "Error al registrar la venta en el servidor.");
    }

    // 5. Descontar stock en la base de datos (Backend)
    try {
      await descontarStock(carrito);
    } catch (stockError) {
      console.error("Error al descontar stock:", stockError);
      alert(`Venta registrada pero hay error en stock: ${stockError.message}`);
    }

    // 6. Impresión (se dispara después de registrar)
    imprimirTicket(nuevaVenta, carrito);

    // 7. Limpieza y reset de interfaz
    setCarrito([]);
    setDescuentoPorcentaje(0);
    setBusquedaCliente("");

    // Buscamos el ID del consumidor final para dejarlo seleccionado para la próxima venta
    const consumidor = clientes.find(c => c.nombre.toUpperCase().includes("CONSUMIDOR"));
    if (consumidor) {
      setClienteId(consumidor.id.toString());
    }

    // Devolvemos el foco al buscador de productos para el siguiente cliente
    setTimeout(() => {
      inputBusquedaRef.current?.focus();
    }, 100);

  } catch (error) {
    console.error("Error en flujo de venta:", error);
    alert(`Error: ${error.message}`);
  }
}, [carrito, totalFinal, clienteId, clientes, usuario, subtotal, montoDescuento, impuesto, registrarVenta, descontarStock]);

  useEffect(() => {
  const manejarTeclado = (e) => {
    // Si presiona F10
    if (e.key === 'F10') {
      e.preventDefault(); // Evita que el navegador abra cosas por defecto
      finalizarVenta();
    }
    
    // OPCIONAL: F2 para enfocar el buscador de productos rápidamente
    if (e.key === 'F2') {
      e.preventDefault();
      inputBusquedaRef.current?.focus();
    }
  };

  window.addEventListener('keydown', manejarTeclado);
  return () => window.removeEventListener('keydown', manejarTeclado);
  }, [finalizarVenta]);

  // --- FILTRADO DE CLIENTES (CORREGIDO) ---
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
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(busqueda.toLowerCase()))
    );
    setResultados(filtrados);
  }, [busqueda, productos]);

  const handleAgregar = (producto) => {
    const itemExistente = carrito.find(i => i.id === producto.id);
    const cantActual = itemExistente ? itemExistente.cantidad : 0;
    if (producto.stock <= cantActual) return alert("Stock insuficiente");

    setCarrito(prev => {
      if (itemExistente) return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      return [...prev, { ...producto, cantidad: 1 }];
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
      descuento: descuentoPorcentaje, // Guardamos el descuento aplicado
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
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 overflow-hidden p-2">
      
      {/* HEADER POS */}
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1.5 uppercase italic">Tech2Solution POS</h1>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="text-brand font-black text-[10px] px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-100 uppercase italic">
              Cajero: {usuario?.nombre} {esRangoAlto && `(${usuario?.rol.toUpperCase()})`}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tight">{formatoFecha} | {formatoHora}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAbiertasModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl font-black text-[10px] uppercase hover:bg-amber-100 transition-all shadow-sm">
            <Receipt size={14} /> Abiertas ({facturasAbiertas.length})
          </button>
          <button onClick={guardarEnAbiertas} disabled={carrito.length === 0} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-brand border border-indigo-100 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-100 transition-all disabled:opacity-50">
            <Save size={14} /> Pausar
          </button>

          <div className="w-[1px] h-8 bg-slate-200 mx-1"></div>

          {/* BUSCADOR DE CLIENTES (Reemplaza al Select) */}
          <div className="relative group">
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-inner w-64">
              <UserIcon size={16} className={clienteId ? "text-brand" : "text-slate-300"} />
              <input 
                type="text"
                className="bg-transparent outline-none text-[11px] font-black uppercase text-slate-700 w-full placeholder:text-slate-300"
                placeholder="Buscar Cliente / RNC..."
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

            {/* Lista Desplegable de Resultados */}
            {mostrarListaClientes && resultadosClientes.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl z-[120] max-h-60 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2">
                {resultadosClientes.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => {
                      setClienteId(c.id.toString());
                      setBusquedaCliente(c.nombre);
                      setMostrarListaClientes(false);
                    }}
                    className="flex flex-col px-4 py-2 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                  >
                    <span className="text-[10px] font-black text-slate-700 uppercase">{c.nombre}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">RNC: {c.rnc || '---'} • {c.categoria}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CUERPO POS */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        <div className="col-span-8 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* BUSCADOR DE PRODUCTOS */}
          <div className="p-4 border-b border-slate-100 relative z-20">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                ref={inputBusquedaRef} 
                autoFocus 
                type="text" 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
                placeholder="Buscar producto por nombre o SKU..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand outline-none text-sm font-medium" 
              />
            </div>
            {resultados.length > 0 && (
              <div className="absolute left-4 right-4 top-[68px] z-50 bg-white border border-slate-200 shadow-2xl rounded-xl max-h-60 overflow-y-auto p-2">
                {resultados.map(prod => (
                  <div key={prod.id} onClick={() => handleAgregar(prod)} className="flex justify-between items-center px-4 py-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors">
                    <div>
                      <span className="font-bold text-slate-700 text-sm uppercase">{prod.nombre}</span>
                      <span className="block text-[10px] font-black text-slate-400">DISPONIBLE: {prod.stock}</span>
                    </div>
                    <span className="font-black text-brand text-sm">RD$ {prod.precio.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TABLA DEL CARRITO */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-100 font-black uppercase text-[10px] text-slate-400 tracking-widest italic">
                <tr>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3 text-center">Cant.</th>
                  <th className="px-6 py-3 text-right">Subtotal</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {carrito.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center opacity-20">
                      <CartIcon size={40} className="mx-auto mb-2" />
                      <p className="text-[10px] uppercase font-black tracking-widest">Carrito Vacío</p>
                    </td>
                  </tr>
                ) : (
                  carrito.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 uppercase text-slate-700">{item.nombre}</td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setCarrito(prev => prev.map(i => i.id === item.id ? {...i, cantidad: Math.max(1, i.cantidad - 1)} : i))} className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200"><MinusIcon size={12}/></button>
                          <span className="w-6 text-center font-black">{item.cantidad}</span>
                          <button onClick={() => handleAgregar(item)} className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200"><PlusIcon size={12}/></button>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right font-black italic">RD$ {(item.precio * item.cantidad).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => setCarrito(carrito.filter(i => i.id !== item.id))} className="text-slate-200 hover:text-red-500 transition-colors"><TrashIcon size={16}/></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLUMNA DERECHA: TOTALES */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="flex-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between border-b border-slate-100 pb-3 font-black uppercase text-[10px] tracking-widest italic text-slate-700">
                <h2>Detalle de Cobro</h2>
                <TicketIcon size={16} className="text-brand" />
              </div>
              
              <div className="space-y-3 text-xs font-black uppercase">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px]">Subtotal Bruto</span>
                  <span className="text-slate-800">RD$ {subtotal.toLocaleString()}</span>
                </div>
                
                {/* BOTÓN DESCUENTO DINÁMICO */}
                <div className="flex justify-between items-center group cursor-pointer" onClick={() => setShowDescuentoModal(true)}>
                  <span className="text-[10px] text-slate-400 group-hover:text-brand flex items-center gap-1 transition-colors">
                    Descuento ({descuentoPorcentaje}%) <Edit3 size={10}/>
                  </span>
                  <span className="text-rose-500 font-black">
                    {descuentoPorcentaje > 0 && `- `} RD$ {montoDescuento.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px]">ITBIS ({itbisGlobal}%)</span>
                  <span className="text-slate-800">RD$ {impuesto.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-dashed border-slate-100 text-center uppercase">
                <p className="text-[10px] font-black text-slate-400 mb-1 tracking-widest">Total a Pagar</p>
                <div className="text-4xl font-black text-slate-800 tracking-tighter italic">
                  <span className="text-sm align-top mr-1 font-bold text-slate-400">RD$</span>
                  {totalFinal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <button 
              onClick={finalizarVenta} 
              disabled={carrito.length === 0} 
              className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl transition-all uppercase flex flex-col items-center justify-center ${
                carrito.length > 0 ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarIcon size={18} /> 
                <span>Finalizar Factura</span>
              </div>
              <span className="text-[9px] opacity-70 mt-1">[ Presione F10 ]</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODALES (Descuento y Abiertas) */}
      {showDescuentoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black uppercase text-xs tracking-widest italic">Aplicar Descuento</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Rol: {usuario?.rol}</p>
              </div>
              <button onClick={() => setShowDescuentoModal(false)}><X size={20} /></button>
            </div>
            <div className="p-8">
              <div className="relative mb-6">
                <input type="number" autoFocus value={tempDescuento} onChange={(e) => setTempDescuento(e.target.value)} placeholder="0" className="w-full text-5xl font-black text-center outline-none text-slate-800" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">%</span>
              </div>
              <button onClick={aplicarDescuentoSeguro} className="w-full bg-brand text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-600 transition-all">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showAbiertasModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-amber-50 border-b border-amber-100 flex justify-between items-center font-black uppercase text-xs italic tracking-widest">
              <h3>Facturas en Espera</h3>
              <button onClick={() => setShowAbiertasModal(false)}><X size={24} /></button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {facturasAbiertas.map(f => (
                <div key={f.id} onClick={() => recuperarFactura(f)} className="p-4 border border-slate-100 rounded-2xl hover:border-brand hover:bg-slate-50 cursor-pointer flex justify-between items-center group transition-all">
                  <div>
                    <p className="text-slate-800 font-black text-sm uppercase group-hover:text-brand transition-colors">{f.cliente}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{f.hora} {esRangoAlto && `• ${f.vendedorNombre}`}</p>
                  </div>
                  <p className="text-brand font-black italic">RD$ {f.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;
