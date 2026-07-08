import React from 'react'; // Este archivo fue movido, no cambiado.
import { Building2 } from 'lucide-react';

const DatosEmpresa = ({ datosNegocio, handleInputChange }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
        <Building2 size={18} className="text-slate-900" />
        <h2 className="font-black text-slate-700 uppercase text-[11px] tracking-widest leading-none">Datos de la Empresa (Encabezado)</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social</label>
          <input name="nombre" value={datosNegocio.nombre} onChange={handleInputChange} 
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-700 text-xs uppercase" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">RNC / Cédula Comercial</label>
          <input name="rnc" value={datosNegocio.rnc || ''} onChange={handleInputChange} placeholder="Ej: 131-XXXXX-X"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-700 text-xs" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono Fijo</label>
          <input name="telefono" value={datosNegocio.telefono || ''} onChange={handleInputChange} placeholder="809-XXX-XXXX"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-700 text-xs" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Física</label>
          <input name="direccion" value={datosNegocio.direccion || ''} onChange={handleInputChange} 
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-700 text-xs uppercase" />
        </div>
      </div>
      
      <div className="space-y-1 pt-2">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje de Cierre (Pie del Ticket)</label>
        <input name="mensaje" value={datosNegocio.mensaje} onChange={handleInputChange} 
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-700 text-xs" />
      </div>
    </div>
  );
};

export default DatosEmpresa;