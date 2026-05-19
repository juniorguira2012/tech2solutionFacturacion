import React from 'react';
import { Package } from 'lucide-react';

export const FormTransferencia = ({ 
  productos, almacenesDisponibles, transferProductoId, setTransferProductoId,
  almacenOrigen, setAlmacenOrigen, almacenDestino, setAlmacenDestino,
  transferCantidad, setTransferCantidad, transferNota, setTransferNota, onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3">
        <Package className="text-indigo-500 shrink-0 mt-0.5" size={16} />
        <p className="text-[10px] font-bold text-indigo-700 leading-relaxed uppercase">
          Moverás stock de un punto a otro de manera directa. Asegúrate de que el almacén de origen cuente con la disponibilidad física.
        </p>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Producto a Transferir</label>
        <select 
          required 
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white outline-none focus:border-brand transition-all cursor-pointer" 
          value={transferProductoId} 
          onChange={(e) => setTransferProductoId(e.target.value)}
        >
          <option value="">Seleccionar Producto...</option>
          {productos.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.codigo ? `(${p.codigo})` : ''} — [Disponibilidad: {p.stock}]
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Almacén Origen</label>
          <select 
            required 
            className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white outline-none focus:border-brand transition-all" 
            value={almacenOrigen} 
            onChange={(e) => setAlmacenOrigen(e.target.value)}
          >
            <option value="">Seleccionar Origen...</option>
            {almacenesDisponibles.map(alm => <option key={alm} value={alm}>{alm}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Almacén Destino</label>
          <select 
            required 
            className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white outline-none focus:border-brand transition-all" 
            value={almacenDestino} 
            onChange={(e) => setAlmacenDestino(e.target.value)}
          >
            <option value="">Seleccionar Destino...</option>
            {almacenesDisponibles.map(alm => <option key={alm} value={alm}>{alm}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Cantidad a Mover</label>
        <input 
          type="number" required min="1" placeholder="Ej: 10"
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:border-brand" 
          value={transferCantidad} onChange={(e) => setTransferCantidad(e.target.value)} 
        />
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Nota de Transferencia</label>
        <input 
          type="text" placeholder="Ej: Reabastecimiento por alta demanda"
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:border-brand" 
          value={transferNota} onChange={(e) => setTransferNota(e.target.value)} 
        />
      </div>

      <button type="submit" className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-98">
        Ejecutar Transferencia
      </button>
    </form>
  );
};