import React, { useEffect, useState } from 'react';
import { Layers3, Search, Calendar, AlertTriangle, Package, Warehouse, Info } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';

const LotesSection = () => {
  const { lotes, cargarLotes, loading } = useInventario();
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    cargarLotes();
  }, [cargarLotes]);

  const lotesFiltrados = lotes.filter(l => 
    l.numeroLote?.toLowerCase().includes(filtro.toLowerCase()) ||
    l.producto?.nombre?.toLowerCase().includes(filtro.toLowerCase())
  );

  const getEstadoLote = (fechaVencimiento) => {
    if (!fechaVencimiento) return { label: 'Sin Vencimiento', color: 'bg-slate-100 text-slate-500' };
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: 'Vencido', color: 'bg-red-500 text-white' };
    if (diffDays <= 30) return { label: 'Próximo a Vencer', color: 'bg-amber-500 text-white' };
    return { label: 'Vigente', color: 'bg-emerald-500 text-white' };
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Cabecera Técnica */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white rounded-lg">
            <Layers3 size={18} />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Trazabilidad por Lotes</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Control de caducidad y registros de producción</p>
          </div>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Buscar por lote o producto..." 
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand text-[10px] font-bold uppercase"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Lotes */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-black tracking-widest italic">
            <tr>
              <th className="px-6 py-4">Producto / Info</th>
              <th className="px-6 py-4">No. Lote</th>
              <th className="px-6 py-4 text-center">Vencimiento</th>
              <th className="px-6 py-4 text-center">Existencia</th>
              <th className="px-6 py-4 text-right">Almacén</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {lotesFiltrados.length > 0 ? (
              lotesFiltrados.map(lote => {
                const estado = getEstadoLote(lote.fechaVencimiento);
                return (
                  <tr key={lote.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-brand">
                          <Package size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700 uppercase italic">{lote.producto?.nombre}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">SKU: {lote.producto?.codigo || '---'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-600 font-mono">
                        {lote.numeroLote}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-600">{lote.fechaVencimiento ? new Date(lote.fechaVencimiento).toLocaleDateString() : 'N/A'}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter ${estado.color}`}>
                          {estado.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-black text-slate-800">{lote.cantidad} <span className="text-[9px] text-slate-400 uppercase">uds</span></span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-[10px] text-slate-400 uppercase italic">
                      {lote.almacen || 'Principal'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <Layers3 size={40} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No se encontraron lotes activos para este filtro</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LotesSection;