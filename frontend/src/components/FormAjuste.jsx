// components/inventario/FormAjuste.jsx
import React from 'react';
import { SlidersHorizontal, DollarSign } from 'lucide-react';

export const FormAjuste = ({ 
  productos, almacenesDisponibles, ajusteProductoId, setAjusteProductoId,
  almacenDestino, setAlmacenDestino, ajusteCantidad, setAjusteCantidad, 
  ajusteCosto, setAjusteCosto, ajusteNota, setAjusteNota, onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Banner Informativo */}
      <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-3">
        <SlidersHorizontal className="text-amber-500 shrink-0 mt-0.5" size={16} />
        <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
          Cuidado: Un ajuste de inventario modificará directamente las existencias reales y los valores contables en el sistema. Asegúrate de justificar el motivo.
        </p>
      </div>

      {/* Selector de Producto */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Producto a Ajustar</label>
        <select 
          required 
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white outline-none focus:border-brand transition-all cursor-pointer" 
          value={ajusteProductoId} 
          onChange={(e) => setAjusteProductoId(e.target.value)}
        >
          <option value="">Seleccionar Producto...</option>
          {productos.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.codigo ? `(${p.codigo})` : ''} — [Stock Actual: {p.stock}]
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Selector de Almacén */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Almacén a Afectar</label>
          <select 
            required 
            className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold bg-white outline-none focus:border-brand transition-all" 
            value={almacenDestino} 
            onChange={(e) => setAlmacenDestino(e.target.value)}
          >
            <option value="">Seleccionar Almacén...</option>
            {almacenesDisponibles.map(alm => <option key={alm} value={alm}>{alm}</option>)}
          </select>
        </div>

        {/* Costo Unitario */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Costo Unitario (RD$)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
            <input 
              type="number" required min="0" step="0.01" placeholder="0.00"
              className="w-full h-12 pl-8 pr-4 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:border-brand" 
              value={ajusteCosto} onChange={(e) => setAjusteCosto(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Cantidad Nueva */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Nueva Cantidad Física Real</label>
        <input 
          type="number" required min="0" placeholder="Ej: 45 (Establecerá este número como el stock actual)"
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:border-brand" 
          value={ajusteCantidad} onChange={(e) => setAjusteCantidad(e.target.value)} 
        />
      </div>

      {/* Nota / Justificación */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">Justificación del Ajuste</label>
        <input 
          type="text" required placeholder="Ej: Auditoría trimestral / Mercancía rota encontrada en revisión"
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:border-brand" 
          value={ajusteNota} onChange={(e) => setAjusteNota(e.target.value)} 
          maxLength={150}
        />
      </div>

      {/* Botón de Acción */}
      <button type="submit" className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 transition-all active:scale-98">
        Aplicar Ajuste Físico
      </button>
    </form>
  );
};