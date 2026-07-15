import React from 'react';
import { AlertTriangle, LogOut, ShieldCheck } from 'lucide-react';

export const InactivityModal = ({ isOpen, countdown, onStay, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        <div className="flex justify-center pt-10 pb-4">
          <div className="h-20 w-20 rounded-3xl flex items-center justify-center bg-amber-50">
            <AlertTriangle size={40} className="text-amber-500" />
          </div>
        </div>

        <div className="px-10 pb-8 text-center space-y-2">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">¿Sigues ahí?</h3>
          <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
            Tu sesión se cerrará automáticamente por inactividad en
          </p>
          <div className="py-2">
            <span className="text-5xl font-black text-amber-500 tracking-tighter">{countdown}</span>
            <span className="text-sm font-bold text-slate-400 ml-2">segundos</span>
          </div>
        </div>

        <div className="flex border-t border-slate-100">
          <button 
            onClick={onLogout} 
            className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-colors border-r border-slate-100 flex items-center justify-center gap-2"
          >
            <LogOut size={14} /> Salir
          </button>
          <button 
            onClick={onStay} 
            className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-brand hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck size={14} /> Continuar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};