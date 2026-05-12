import React, { useState } from 'react';
import { Ruler, Plus, CheckCircle, X, Edit3, Trash2 } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';

const UnidadesSection = () => {
  const { unidadesMedida, setUnidadesMedida } = useInventario();
  const [editingUnidadId, setEditingUnidadId] = useState(null);
  const [unidadDraft, setUnidadDraft] = useState({ codigo: '', nombre: '' });

  const agregarUnidad = () => {
    const nuevo = { id: Date.now(), codigo: (unidadDraft.codigo || 'UND').toUpperCase(), nombre: unidadDraft.nombre || 'Nueva Unidad', activo: true };
    setUnidadesMedida(prev => [...prev, nuevo]);
    setUnidadDraft({ codigo: '', nombre: '' });
    setEditingUnidadId(null);
  };

  const comenzarEditarUnidad = (u) => {
    setEditingUnidadId(u.id);
    setUnidadDraft({ codigo: u.codigo, nombre: u.nombre });
  };

  const guardarUnidadEditada = (id) => {
    setUnidadesMedida(prev => prev.map(u => u.id === id ? { ...u, codigo: (unidadDraft.codigo||u.codigo).toUpperCase(), nombre: unidadDraft.nombre || u.nombre } : u));
    setEditingUnidadId(null);
    setUnidadDraft({ codigo: '', nombre: '' });
  };

  const toggleUnidadActivo = (id) => {
    setUnidadesMedida(prev => prev.map(u => u.id === id ? { ...u, activo: !u.activo } : u));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
      <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
          <Ruler size={18} />
        </div>
        <div>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Unidades de medida</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gestiona tipos de unidad (editar o desactivar)</p>
        </div>
        <div className="ml-auto">
          <button type="button" onClick={() => { setEditingUnidadId('new'); setUnidadDraft({codigo:'', nombre:''}); }} className="h-9 px-3 rounded-lg bg-emerald-500 text-white font-black flex items-center gap-2 text-[10px] uppercase">
            <Plus size={14}/> Nueva unidad
          </button>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {unidadesMedida.map(u => (
          <div key={u.id} className="flex items-center gap-3 p-3 bg-white border rounded-xl">
            {editingUnidadId === u.id ? (
              <>
                <input className="w-24 px-3 py-2 border rounded-lg text-xs" value={unidadDraft.codigo} onChange={(e)=>setUnidadDraft({...unidadDraft, codigo:e.target.value})}/>
                <input className="flex-1 px-3 py-2 border rounded-lg text-xs" value={unidadDraft.nombre} onChange={(e)=>setUnidadDraft({...unidadDraft, nombre:e.target.value})}/>
                <button onClick={()=>guardarUnidadEditada(u.id)} className="px-3 py-2 bg-emerald-500 text-white rounded-lg"><CheckCircle size={14}/></button>
                <button onClick={() => setEditingUnidadId(null)} className="px-3 py-2 bg-red-50 text-red-500 rounded-lg"><X size={14}/></button>
              </>
            ) : (
              <>
                <div className="w-24">
                  <span className="text-xs font-black">{u.nombre}</span>
                  <div className="text-[10px] text-slate-400 uppercase">{u.codigo}</div>
                </div>
                <div className="flex-1 text-[10px] font-bold uppercase text-slate-400">{u.activo ? 'Activo' : 'Desactivado'}</div>
                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={()=>comenzarEditarUnidad(u)} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg"><Edit3 size={14}/></button>
                  <button onClick={()=>toggleUnidadActivo(u.id)} className={`px-3 py-2 rounded-lg ${u.activo ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    {u.activo ? <Trash2 size={14}/> : <CheckCircle size={14}/>} 
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnidadesSection;