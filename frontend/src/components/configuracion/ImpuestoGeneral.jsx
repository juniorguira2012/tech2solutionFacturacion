import React from 'react';
import { Percent } from 'lucide-react';

const tiposDeImpuesto = [
  { nombre: 'ITBIS', default: 18 },
  { nombre: 'ISC', default: 10 },
  { nombre: 'CDT', default: 2 },
  { nombre: 'ISR', default: 10 },
  { nombre: 'IPI', default: 1 },
];

const ImpuestoGeneral = ({
  impuestoActivo,
  setImpuestoActivo,
  impuestosActivos,
  setImpuestosActivos,
  impuestos,
  setImpuestos,
}) => {
  const handleImpuestoChange = (nombre, valor) => {
    setImpuestos(prev => ({ ...prev, [nombre]: valor }));
  };
  
  const handleToggleImpuestoActivo = (nombre) => {
    setImpuestosActivos(prev => ({
      ...prev,
      [nombre]: !prev[nombre]
    }));
  };
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Percent size={16} /></div>
          <h2 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Impuesto General</h2>
        </div>
        <button
          type="button"
          onClick={() => setImpuestoActivo(!impuestoActivo)}
          className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${impuestoActivo ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <div className={`absolute top-1 bg-white h-5 w-5 rounded-full shadow-md transition-all ${impuestoActivo ? 'right-1' : 'left-1'}`}></div>
        </button>
      </div>
      {impuestoActivo && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Impuestos a Aplicar</label>
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
              {tiposDeImpuesto.map(imp => (
                <label key={imp.nombre} className={`flex items-center justify-center gap-2 py-2 text-[10px] font-black rounded-xl border-2 transition-all uppercase cursor-pointer ${impuestosActivos[imp.nombre] ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                  <input
                    type="checkbox"
                    checked={!!impuestosActivos[imp.nombre]}
                    onChange={() => handleToggleImpuestoActivo(imp.nombre)}
                    className="h-3 w-3 rounded-sm border-slate-300 text-brand focus:ring-brand"
                  />
                  {imp.nombre}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Configuración de Porcentajes</label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {tiposDeImpuesto.map(imp => (
                <div key={imp.nombre} className="relative">
                  <input type="number" value={impuestos[imp.nombre] || ''} onChange={(e) => handleImpuestoChange(imp.nombre, e.target.value)} className="w-full pl-12 pr-2 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-emerald-600 text-center focus:bg-white outline-none focus:border-emerald-500" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400 text-[9px] uppercase">{imp.nombre}</span>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-slate-300 text-[9px]">%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpuestoGeneral;