import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, UserCircle, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const res = await login(form.username, form.password);
    if (res && res.success) {
      navigate('/home', { replace: true }); 
    } else {
      setError(res ? res.message : 'Error de conexión');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-indigo-100">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 md:p-14 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-indigo-50 text-brand rounded-[2.5rem] mb-6 shadow-inner">
            <ShieldCheck size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">Tech2solution</h1>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mt-4">Security Access Control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CAMPO USUARIO */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Identificación</label>
            <div className="relative group">
              <input 
                type="text" 
                required
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all font-bold text-slate-700 placeholder:text-slate-300 text-sm"
                placeholder="Usuario o Email"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
              />
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand transition-colors" size={20} />
            </div>
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Clave de Acceso</label>
            <div className="relative group">
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all font-bold text-slate-700 placeholder:text-slate-300 text-sm"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand transition-colors" size={20} />
            </div>
          </div>

          {/* MENSAJE DE ERROR PERSONALIZADO */}
          {error && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-2 ${
              error.includes('suspendida') 
              ? 'bg-amber-50 border-amber-100 text-amber-700' 
              : 'bg-red-50 border-red-100 text-red-500'
            }`}>
              <AlertCircle size={18} />
              <p className="text-[10px] font-black uppercase tracking-tight leading-tight italic">
                {error}
              </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black shadow-2xl hover:bg-black active:scale-[0.97] disabled:bg-slate-300 transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] mt-4"
          >
            {isLoading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Validar Identidad'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;