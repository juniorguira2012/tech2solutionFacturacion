import React, { useState } from 'react';
import { 
  Printer, Percent, Database, Save, 
  Download, Upload, ArrowRight, Users, 
  ShieldCheck, Terminal, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Configuracion = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  // --- ESTADOS ---
  const [itbis, setItbis] = useState(localStorage.getItem('posfactura_itbis') || 18);
  const [papel, setPapel] = useState(localStorage.getItem('posfactura_papel') || '80mm');
  const [datosNegocio, setDatosNegocio] = useState(() => {
    const savedConfig = localStorage.getItem('posfactura_config');
    return savedConfig ? JSON.parse(savedConfig) : { nombre: 'Mi Negocio S.A.', mensaje: '¡Gracias!' };
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosNegocio(prev => ({ ...prev, [name]: value }));
  };

  const guardarParametros = () => {
    localStorage.setItem('posfactura_itbis', itbis);
    localStorage.setItem('posfactura_papel', papel);
    localStorage.setItem('posfactura_config', JSON.stringify(datosNegocio));
    alert("✅ Configuración actualizada.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic leading-none">Configuración</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 italic">Ajustes de Terminal</p>
        </div>
        <button onClick={guardarParametros} className="bg-brand text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all">
          <Save size={18} /> Guardar Cambios
        </button>
      </header>

      {/* 2. SECCIÓN DE SEGURIDAD (Oculta para Cajeros) */}
      {(usuario?.rol === 'admin' || usuario?.rol === 'supervisor') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/usuarios')}
            className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-brand transition-all shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-indigo-50 text-brand rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 uppercase italic text-sm">Usuarios</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gestión de Personal</p>
              </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-brand transition-all" />
          </button>

          {/* Solo el Admin ve los Roles */}
          {usuario?.rol === 'admin' && (
            <button 
              onClick={() => navigate('/roles')}
              className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-purple-500 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase italic text-sm">Permisos</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Niveles de Acceso</p>
                </div>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-purple-500 transition-all" />
            </button>
          )}
        </div>
      )}

      {/* 3. AJUSTES GENERALES (Todos pueden ver esto) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-5">
              <Terminal size={20} className="text-brand" />
              <h2 className="font-black text-slate-700 uppercase text-xs tracking-widest leading-none">Identidad</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                <input name="nombre" value={datosNegocio.nombre} onChange={handleInputChange} 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand font-bold text-slate-700 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje Ticket</label>
                <input name="mensaje" value={datosNegocio.mensaje} onChange={handleInputChange} 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand font-bold text-slate-700 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Printer size={20} className="text-slate-400" />
              <h2 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Papel</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['58mm', '80mm', 'A4'].map((size) => (
                <button key={size} onClick={() => setPapel(size)}
                  className={`py-4 rounded-2xl border-2 font-black text-xs uppercase transition-all ${papel === size ? 'border-brand bg-brand/5 text-brand shadow-md shadow-indigo-50' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Percent size={18} /></div>
              <h2 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">ITBIS</h2>
            </div>
            <div className="relative">
              <input type="number" value={itbis} onChange={(e) => setItbis(e.target.value)}
                className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-3xl text-emerald-600 text-center" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-7 shadow-2xl text-white">
            <div className="flex items-center gap-3 mb-6">
              <Database size={18} className="text-indigo-400" />
              <h2 className="font-black uppercase text-[10px] tracking-widest text-slate-400">Backup</h2>
            </div>
            <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left">
              <div className="flex items-center gap-3">
                <Download size={16} className="text-indigo-400" />
                <span className="font-black text-[10px] uppercase tracking-widest">Generar Backup</span>
              </div>
              <ArrowRight size={14} className="text-white/20" />
            </button>
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <p className="text-[7px] font-bold uppercase leading-tight text-amber-200/50">Solo Admins pueden restaurar.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Configuracion;
