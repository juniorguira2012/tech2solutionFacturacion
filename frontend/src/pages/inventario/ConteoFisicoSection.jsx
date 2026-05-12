import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Plus, LayoutGrid, List, 
  History, CheckCircle, XCircle, Clock, 
  ArrowRight, Warehouse, BarChart3, Edit3, Trash2
} from 'lucide-react';

const ConteoFisicoSection = ({ mostrarToast }) => {
  const [vista, setVista] = useState(() => {
    return localStorage.getItem('posfactura_conteo_vista') || 'grid';
  });

  useEffect(() => {
    localStorage.setItem('posfactura_conteo_vista', vista);
  }, [vista]);

  // Datos de ejemplo basados en la estructura del backend
  const [conteos, setConteos] = useState([
    { id: 1, almacen: 'Principal', descripcion: 'Auditoría Mensual Octubre', fecha: '2023-10-25', estado: 'borrador', items: 12, progreso: 65 },
    { id: 2, almacen: 'Secundario', descripcion: 'Ajuste Stock Anual', fecha: '2023-10-20', estado: 'publicado', items: 45, progreso: 100 },
    { id: 3, almacen: 'Externo', descripcion: 'Revisión Dañados', fecha: '2023-10-15', estado: 'cancelado', items: 8, progreso: 0 },
  ]);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'publicado':
        return <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm bg-emerald-500 text-white flex items-center gap-1"><CheckCircle size={8}/> Finalizado</span>;
      case 'cancelado':
        return <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm bg-red-500 text-white flex items-center gap-1"><XCircle size={8}/> Anulado</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm bg-amber-500 text-white flex items-center gap-1"><Clock size={8}/> En Curso</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera de Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand text-white rounded-xl shadow-lg shadow-indigo-100">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">Auditoría Física</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Conteo y Verificación de Stock</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setVista('grid')}
              className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${vista === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              title="Vista de Tarjetas"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setVista('lista')}
              className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${vista === 'lista' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              title="Vista de Tabla"
            >
              <List size={16} />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-brand transition-all active:scale-95">
            <Plus size={16} /> Iniciar Conteo
          </button>
        </div>
      </div>

      {/* Vista de Cuadrícula (Estilo Producto) */}
      {vista === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3">
          {conteos.map(conteo => (
            <article key={conteo.id} className="group rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 z-10 bg-brand"></div>
              
              <div className="relative aspect-[2.5/1] bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                <History size={32} className="text-brand/20" />
                <div className="absolute left-2 top-2 flex gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm bg-slate-900 text-white">Sesión</span>
                  {getStatusBadge(conteo.estado)}
                </div>
              </div>

              <div className="p-3 space-y-2.5">
                <div className="min-h-[3rem]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-800 uppercase text-xs tracking-tight truncate">{conteo.descripcion}</h3>
                      <p className="text-[9px] text-slate-400 font-bold tracking-tight italic">#{conteo.id.toString().padStart(4, '0')} · {conteo.fecha}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-slate-600">
                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Almacén Destino</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Warehouse size={12} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase truncate">{conteo.almacen}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-emerald-600">
                    <p className="text-[8px] font-black uppercase tracking-wider opacity-70">Progreso</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <BarChart3 size={12} />
                      <span className="text-base font-black">{conteo.progreso}%</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-slate-600">
                    <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Registros</p>
                    <p className="mt-0.5 text-[10px] font-black uppercase truncate">{conteo.items} items</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-all">
                    Continuar <ArrowRight size={12}/>
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Vista de Lista (Tabla Técnica) */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-black tracking-widest italic">
              <tr>
                <th className="px-6 py-4">Auditoría / ID</th>
                <th className="px-6 py-4">Almacén</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {conteos.map(conteo => (
                <tr key={conteo.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ClipboardList size={16} className="text-brand" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 uppercase italic">{conteo.descripcion}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">#{conteo.id.toString().padStart(4, '0')} · {conteo.fecha}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{conteo.almacen}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 bg-indigo-50 text-brand rounded-md text-[9px] font-black">{conteo.items} items</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(conteo.estado)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:text-brand transition-all"><Edit3 size={14}/></button>
                      <button className="p-2 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConteoFisicoSection;