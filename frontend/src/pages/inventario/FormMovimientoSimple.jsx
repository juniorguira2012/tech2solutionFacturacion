// components/inventario/FormMovimientoSimple.jsx
import React from 'react';

export const FormMovimientoSimple = ({ tipoMovimiento, productos, movimientoData, setMovimientoData, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Producto</label>
        <select 
          required 
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white" 
          value={movimientoData.productoId} 
          onChange={(e) => setMovimientoData({...movimientoData, productoId: e.target.value})}
        >
          <option value="">Seleccionar Producto...</option>
          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Cantidad</label>
        <input 
          type="number" required min="1" 
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold" 
          value={movimientoData.cantidad} 
          onChange={(e) => setMovimientoData({...movimientoData, cantidad: e.target.value})} 
        />
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
      <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
        Confirmar {tipoMovimiento}
      </button>
    </form>
  );
};