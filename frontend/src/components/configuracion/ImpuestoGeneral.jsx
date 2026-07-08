import React from 'react';
import { Percent } from 'lucide-react';

const ImpuestoGeneral = ({
  impuestoActivo,
  setImpuestoActivo,
  nombreImpuesto,
  setNombreImpuesto,
  itbis,
  setItbis,
}) => {
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
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Impuesto</label>
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
              {['ITBIS', 'ISR', 'ISC', 'IPI', 'ISD'].map(imp => (
                <button key={imp} type="button" onClick={() => setNombreImpuesto(imp)} className={`py-2 text-[10px] font-black rounded-xl border-2 transition-all uppercase ${nombreImpuesto === imp ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{imp}</button>
              ))}
            </div>
          </div>
          <div className="relative flex items-center">
            <input type="number" value={itbis} onChange={(e) => setItbis(e.target.value)} className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-3xl text-emerald-600 text-center focus:bg-white outline-none focus:border-emerald-500" />
            <span className="absolute right-6 font-black text-slate-300 text-xl">%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpuestoGeneral;