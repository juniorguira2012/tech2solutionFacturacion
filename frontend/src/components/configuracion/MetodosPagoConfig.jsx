import React, { useState } from 'react';
import { Wallet, Plus, Trash2, Check, X } from 'lucide-react';

const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')       // Remove all non-word chars
    .replace(/--+/g, '-')          // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

const MetodosPagoConfig = ({ metodosPago, setMetodosPago }) => {
  const [newMethodName, setNewMethodName] = useState('');

  const handleAddMethod = () => {
    if (newMethodName.trim() === '') return;

    const id = slugify(newMethodName);
    if (metodosPago.some(m => m.id === id)) {
      alert('Ya existe un método de pago con ese nombre.');
      return;
    }

    setMetodosPago(prev => [...prev, { id, nombre: newMethodName.trim(), activo: true }]);
    setNewMethodName('');
  };

  const handleToggleActive = (id) => {
    setMetodosPago(prev => prev.map(m =>
      m.id === id ? { ...m, activo: !m.activo } : m
    ));
  };

  const handleDeleteMethod = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
      setMetodosPago(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Wallet size={16} /></div>
        <h2 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Métodos de Pago</h2>
      </div>

      <div className="space-y-3">
        {metodosPago.map(method => (
          <div key={method.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="font-bold text-slate-700 text-xs uppercase">{method.nombre}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleActive(method.id)}
                className={`w-12 h-6 rounded-full transition-all relative shadow-inner ${method.activo ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 bg-white h-5 w-5 rounded-full shadow-md transition-all ${method.activo ? 'right-0.5' : 'left-0.5'}`}></div>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMethod(method.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-50">
        <input
          type="text"
          value={newMethodName}
          onChange={(e) => setNewMethodName(e.target.value)}
          placeholder="Nuevo método de pago..."
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand font-bold text-xs uppercase"
        />
        <button type="button" onClick={handleAddMethod} className="px-4 py-2 bg-brand text-white rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus size={14} /> Añadir
        </button>
      </div>
    </div>
  );
};

export default MetodosPagoConfig;