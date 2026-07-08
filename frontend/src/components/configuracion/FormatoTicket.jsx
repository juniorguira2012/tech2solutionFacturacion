import React from 'react';
import { Printer } from 'lucide-react';

const FormatoTicket = ({ papel, setPapel }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <Printer size={18} className="text-slate-400" />
        <h2 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Salida de Impresión</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['58mm', '80mm', 'A4'].map((size) => (
          <button key={size} onClick={() => setPapel(size)} className={`py-3.5 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${papel === size ? 'border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-100' : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-transparent'}`}>{size}</button>
        ))}
      </div>
    </div>
  );
};

export default FormatoTicket;