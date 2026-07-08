import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

const NcfConfig = ({ ncfConfig, handleNcfChange }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
        <FileSpreadsheet size={18} className="text-slate-900" />
        <h2 className="font-black text-slate-700 uppercase text-[11px] tracking-widest leading-none">Secuencias NCF (DGII)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Próximo B01 (Créd. Fiscal)</label>
          <input name="secuenciaB01" value={ncfConfig.secuenciaB01} onChange={handleNcfChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-mono font-bold text-slate-700 text-xs text-center" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Próximo B02 (Consumo)</label>
          <input name="secuenciaB02" value={ncfConfig.secuenciaB02} onChange={handleNcfChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-mono font-bold text-slate-700 text-xs text-center" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Alerta Stock Crítico</label>
          <input type="number" name="alertaMinima" value={ncfConfig.alertaMinima} onChange={handleNcfChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-bold text-slate-700 text-xs text-center" />
        </div>
      </div>
    </div>
  );
};

export default NcfConfig;