import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('inventario.oneredrd.com')
  ? '/api'
  : (import.meta.env.VITE_API_URL || '/api');

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('El token de recuperación falta o ha expirado.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Agregamos este log para ver en la consola de Chrome el error exacto del backend
        console.error('Error del servidor (400):', data);
        // Capturar mensajes detallados de validación de NestJS
        const errorMsg = Array.isArray(data?.message) 
          ? data.message.join(', ') 
          : data?.message;
        setError(errorMsg || 'No se pudo restablecer la contraseña.');
      } else {
        setMessage('¡Contraseña actualizada! Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-indigo-100">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 md:p-14 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-indigo-50 text-brand rounded-[2.5rem] mb-6 shadow-inner">
            <ShieldCheck size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">Nueva Clave</h1>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mt-4">Ingresa tu nueva contraseña de acceso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Nueva Contraseña</label>
            <input
              type="password"
              required
              className="w-full py-4 px-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all font-bold text-slate-700 placeholder:text-slate-300 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Confirmar Contraseña</label>
            <input
              type="password"
              required
              className="w-full py-4 px-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all font-bold text-slate-700 placeholder:text-slate-300 text-sm"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <div className="p-4 rounded-2xl border bg-rose-50 border-rose-100 text-rose-700 text-[10px] font-black uppercase italic">{error}</div>}
          {message && <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-100 text-emerald-700 text-[10px] font-black uppercase italic">{message}</div>}

          <button
            type="submit"
            disabled={loading || message}
            className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black shadow-2xl hover:bg-black active:scale-[0.97] transition-all uppercase text-[10px] tracking-[0.2em] disabled:bg-slate-300"
          >
            {loading ? 'Procesando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;