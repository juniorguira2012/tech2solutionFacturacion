import React from 'react';
import { ArrowLeftRight, List, Download, Truck, RefreshCw, Trash2, Search } from 'lucide-react';

const MovimientosSection = () => {
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
          <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-brand transition-all active:scale-95">
            <List size={14} /> Recibo multi-línea
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-emerald-600 transition-all active:scale-95">
            <Download size={14} /> Recibir
          </button>
          <button className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-sky-600 transition-all active:scale-95">
            <Truck size={14} /> Despachar
          </button>
          <button className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-indigo-600 transition-all active:scale-95">
            <ArrowLeftRight size={14} /> Transferir
          </button>
          <button className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-amber-600 transition-all active:scale-95">
            <RefreshCw size={14} /> Ajustar
          </button>
          <button className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-rose-600 transition-all active:scale-95">
            <Trash2 size={14} /> Descartar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar producto por nombre o código en el historial..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white shadow-sm transition-all"
          />
        </div>
        <select className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-black text-[10px] uppercase text-slate-600 bg-white shadow-sm cursor-pointer">
          <option value="todos">Todos los movimientos</option>
          <option value="venta">Venta</option>
          <option value="compra">Compra</option>
          <option value="transferencia">Transferencia</option>
          <option value="ajuste_entrada">Ajuste de entrada</option>
          <option value="devolucion">Devolución</option>
          <option value="salida">Salida</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-20 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
              <ArrowLeftRight size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Kardex desocupado</p>
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No se han registrado operaciones en el inventario aún.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovimientosSection;