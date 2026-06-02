import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('inventario.oneredrd.com')
  ? '/api'
  : (import.meta.env.VITE_API_URL || '/api');

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validación básica de email en cliente
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Manejar mensajes de error (pueden venir como string o array de validación)
        const errorMsg = Array.isArray(data?.message) 
          ? data.message.join(', ') 
          : data?.message;
        setError(errorMsg || 'No se pudo enviar el correo. Intenta de nuevo.');
      } else {
        setMessage('Si este correo existe en el sistema, recibirás instrucciones para restablecer tu contraseña.');
      }
    } catch (err) {
      console.error('Forgot password error', err);
      setError('Error de conexión. Verifica que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-indigo-100">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 md:p-14 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-indigo-50 text-brand rounded-[2.5rem] mb-6 shadow-inner">
            <Mail size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">Recuperar Contraseña</h1>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mt-4">Teclea tu correo para recibir el enlace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Correo electrónico</label>
            <input
              type="email"
              required
              className="w-full py-4 px-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all font-bold text-slate-700 placeholder:text-slate-300 text-sm"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 rounded-2xl border bg-rose-50 border-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-tight leading-tight italic">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-tight leading-tight italic">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black shadow-2xl hover:bg-black active:scale-[0.97] transition-all uppercase text-[10px] tracking-[0.2em] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>

          <div className="text-center pt-4">
            <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:text-slate-900">
              <ArrowLeft size={14} /> Volver al login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
