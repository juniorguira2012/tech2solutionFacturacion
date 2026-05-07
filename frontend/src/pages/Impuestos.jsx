import React, { useState } from 'react';
import { Percent, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Impuestos = () => {
  const navigate = useNavigate();
  const [itbis, setItbis] = useState(18); // Valor por defecto en RD
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const guardarImpuesto = () => {
    setIsSaving(true);
    // Aquí luego enviaremos el valor a NestJS/PostgreSQL
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Toast de confirmación */}
      {showToast && (
        <div className="fixed top-24 right-8 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-right">
          <CheckCircle size={20} className="text-emerald-400" />
          <span className="font-bold text-sm">ITBIS actualizado correctamente</span>
        </div>
      )}

      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/configuracion')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Impuestos</h1>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
            Tasa de ITBIS General (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="number" 
              className="w-full pl-12 pr-4 py-4 text-2xl font-bold rounded-2xl border border-slate-200 outline-none focus:border-brand focus:ring-4 focus:ring-indigo-50 transition-all"
              value={itbis}
              onChange={(e) => setItbis(e.target.value)}
            />
          </div>
          <p className="mt-4 text-sm text-slate-500 leading-relaxed">
            Este porcentaje se aplicará automáticamente a todos los productos en el módulo de ventas, 
            a menos que se especifique lo contrario en un artículo individual.
          </p>
        </div>

        <button 
          onClick={guardarImpuesto}
          disabled={isSaving}
          className="w-full py-4 bg-brand text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
          {isSaving ? 'Guardando...' : 'Aplicar a toda la tienda'}
        </button>
      </div>
    </div>
  );
};

export default Impuestos;