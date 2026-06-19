// components/inventario/FormMovimientoSimple.jsx
import React from 'react';

export const FormMovimientoSimple = ({ tipoMovimiento, productos, almacenesDisponibles = [], movimientoData, setMovimientoData, onSubmit }) => {
  const productoSeleccionado = productos.find(p => Number(p.id) === Number(movimientoData.productoId));
  const almacenes = almacenesDisponibles.length > 0 ? almacenesDisponibles : ['Principal'];
  const tipoNormalizado = String(tipoMovimiento || '').toUpperCase();
  const descuentaStock = ['DESCARTAR', 'DESPACHAR', 'SALIDA', 'DEVOLUCION'].includes(tipoNormalizado);

  const obtenerStockEnAlmacen = (producto, almacen) => {
    if (!producto || !almacen) return 0;
    const stockAlmacen = producto.warehouseStocks?.find(s => s.almacen === almacen);
    if (stockAlmacen) return Number(stockAlmacen.cantidad) || 0;
    return producto.almacen === almacen ? Number(producto.stock) || 0 : 0;
  };

  const stockDisponible = obtenerStockEnAlmacen(productoSeleccionado, movimientoData.almacenDestino);

  const handleProductoChange = (e) => {
    const productoId = e.target.value;
    const producto = productos.find(p => Number(p.id) === Number(productoId));
    const almacenSugerido = producto?.almacen || producto?.warehouseStocks?.[0]?.almacen || almacenes[0] || 'Principal';

    setMovimientoData({
      ...movimientoData,
      productoId,
      almacenDestino: almacenSugerido,
      cantidad: descuentaStock ? Math.min(Number(movimientoData.cantidad) || 1, Math.max(obtenerStockEnAlmacen(producto, almacenSugerido), 1)) : movimientoData.cantidad
    });
  };

  const handleSubmit = (e) => {
    if (descuentaStock && Number(movimientoData.cantidad) > stockDisponible) {
      e.preventDefault();
      return;
    }

    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Producto</label>
        <select 
          required 
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white" 
          value={movimientoData.productoId} 
          onChange={handleProductoChange}
        >
          <option value="">Seleccionar Producto...</option>
          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Almacén</label>
        <select
          required
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white"
          value={movimientoData.almacenDestino || ''}
          onChange={(e) => setMovimientoData({...movimientoData, almacenDestino: e.target.value})}
        >
          <option value="">Seleccionar almacén...</option>
          {almacenes.map(almacen => <option key={almacen} value={almacen}>{almacen}</option>)}
        </select>
        {productoSeleccionado && (
          <p className={`mt-2 text-[9px] font-black uppercase tracking-widest ${descuentaStock && stockDisponible <= 0 ? 'text-red-500' : 'text-slate-400'}`}>
            Stock disponible en almacén: {stockDisponible}
          </p>
        )}
      </div>
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Cantidad</label>
        <input 
          type="number" required min="1"
          max={descuentaStock ? stockDisponible : undefined}
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold" 
          value={movimientoData.cantidad} 
          onChange={(e) => setMovimientoData({...movimientoData, cantidad: e.target.value})} 
        />
        {descuentaStock && productoSeleccionado && Number(movimientoData.cantidad) > stockDisponible && (
          <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-red-500">
            La cantidad supera el stock disponible en este almacén
          </p>
        )}
      </div>
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Nota / Razón</label>
        <input 
          type="text" 
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold" 
          value={movimientoData.nota} 
          onChange={(e) => setMovimientoData({...movimientoData, nota: e.target.value})} 
        />
      </div>
      <button
        type="submit"
        disabled={descuentaStock && productoSeleccionado && (stockDisponible <= 0 || Number(movimientoData.cantidad) > stockDisponible)}
        className="w-full py-4 bg-slate-900 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
      >
        Confirmar {tipoMovimiento}
      </button>
    </form>
  );
};
