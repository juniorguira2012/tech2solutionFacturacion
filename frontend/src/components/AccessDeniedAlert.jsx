import React from 'react';
import { ArrowLeft, Lock, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessDeniedAlert = ({ modulo = 'esta sección' }) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-xl shadow-slate-200/60">
        <div className="h-2 bg-amber-400" />
        <div className="p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <ShieldAlert size={32} />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Acceso restringido</p>
          <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-slate-800">No puedes ver esta sección</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Tu perfil no tiene permiso para acceder a {modulo}. Solicita acceso al administrador del sistema.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={15} /> Volver
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-brand"
            >
              <Lock size={15} /> Ir al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedAlert;
