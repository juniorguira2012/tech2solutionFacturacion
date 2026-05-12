import React, { useState } from 'react';
import { Tags, Plus, X } from 'lucide-react';

const CategoriasSection = ({ categorias, setCategorias, mostrarToast }) => {
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catFormData, setCatFormData] = useState({ nombre: '', color: '#4f46e5' });

  const guardarCategoria = (e) => {
    e.preventDefault();
    if (!catFormData.nombre.trim()) return;
    
    if (categorias.find(c => c.nombre.toLowerCase() === catFormData.nombre.toLowerCase())) {
      mostrarToast("La categoría ya existe", "warning");
      return;
    }

    setCategorias(prev => [...prev, catFormData]);
    setIsCatModalOpen(false);
    mostrarToast("Categoría creada con éxito");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 text-brand rounded-lg">
            <Tags size={18} />
          </div>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Categoría de productos</h2>
        </div>
        <button 
          onClick={() => {
            setCatFormData({ nombre: '', color: '#4f46e5' });
            setIsCatModalOpen(true);
          }}
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-indigo-600 transition-all active:scale-95"
        >
          <Plus size={14} /> Nueva categoría
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {categorias.map(cat => (
          <article key={cat.nombre} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between group hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: cat.color }}></div>
            <span className="text-[10px] font-black uppercase text-slate-700 tracking-tight ml-2">
              {cat.nombre}
            </span>
            <button 
              onClick={() => {
                if (window.confirm(`¿Seguro que deseas eliminar la categoría "${cat.nombre}"?`)) {
                  setCategorias(prev => prev.filter(c => c.nombre !== cat.nombre));
                }
              }}
              className="p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </article>
        ))}
      </div>

      {isCatModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Nueva Categoría</h2>
              <button onClick={() => setIsCatModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 shadow-sm transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={guardarCategoria} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre</label>
                <input autoFocus required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm text-slate-700 transition-all focus:bg-white" placeholder="Ej. Accesorios"
                  value={catFormData.nombre} onChange={e => setCatFormData({...catFormData, nombre: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Color Distintivo</label>
                <div className="flex gap-3">
                  <input type="color" className="h-14 w-14 rounded-2xl border border-slate-100 cursor-pointer p-1 bg-white"
                    value={catFormData.color} onChange={e => setCatFormData({...catFormData, color: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-brand transition-all uppercase text-[10px] tracking-[0.2em] mt-4">
                Crear Categoría
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasSection;