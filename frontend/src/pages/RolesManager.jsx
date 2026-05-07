import React, { useState, useEffect } from 'react';
import { Shield, Save, CheckCircle, Lock, Eye, Edit3, RotateCcw, ShieldCheck, AlertCircle } from 'lucide-react';

const RolesManager = () => {
  const initialRoles = {
  admin: { 
    modules: { ventas: 'full', inventario: 'full', reportes: 'full', clientes: 'full' },
    viewScope: 'all' // Puede ver todo
  },
  supervisor: { 
    modules: { ventas: 'full', inventario: 'full', reportes: 'view', clientes: 'full' },
    viewScope: 'all' // ¡Aquí está la clave! También puede ver todo
  },
  vendedor: { 
    modules: { ventas: 'full', inventario: 'none', reportes: 'none', clientes: 'full' },
    viewScope: 'own' // Solo ve sus propias ventas
  },
  cajero: { 
    modules: { ventas: 'full', inventario: 'none', reportes: 'none', clientes: 'none' },
    viewScope: 'own' // Solo ve lo que él facture
  }
};

  const [rolesConfig, setRolesConfig] = useState(() => {
    const saved = localStorage.getItem('posfactura_roles_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialRoles, ...parsed }; // Mezcla para asegurar que 'supervisor' exista
    }
    return initialRoles;
  });

  const [rolSeleccionado, setRolSeleccionado] = useState('vendedor');
  const [toast, setToast] = useState(false);

  const modulos = [
    { id: 'ventas', nombre: 'Módulo de Ventas', desc: 'Facturación e historial' },
    { id: 'inventario', nombre: 'Inventario', desc: 'Stock y productos' },
    { id: 'reportes', nombre: 'Reportes y KPI', desc: 'Ingresos y analíticas' },
    { id: 'clientes', nombre: 'Gestión de Clientes', desc: 'Base de datos' }
  ];

  const guardarConfiguracion = () => {
    localStorage.setItem('posfactura_roles_config', JSON.stringify(rolesConfig));
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const resetearRol = () => {
    setRolesConfig({
      ...rolesConfig,
      [rolSeleccionado]: initialRoles[rolSeleccionado]
    });
  };

  const cambiarPermiso = (moduloId, nivel) => {
    setRolesConfig(prev => ({
      ...prev,
      [rolSeleccionado]: {
        ...prev[rolSeleccionado],
        modules: { ...prev[rolSeleccionado].modules, [moduloId]: nivel }
      }
    }));
  };

  // Helper para estilos de botones de permiso
  const getBtnStyle = (moduloId, nivel) => {
    const activo = rolesConfig[rolSeleccionado].modules[moduloId] === nivel;
    const styles = {
      none: activo ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:bg-red-50',
      view: activo ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:bg-amber-50',
      full: activo ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:bg-emerald-50'
    };
    return styles[nivel];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-slate-700 animate-in slide-in-from-right-5">
          <CheckCircle size={20} className="text-emerald-400" />
          <span className="font-black text-xs uppercase tracking-widest">Cambios Guardados</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Seguridad del Sistema</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-brand">Jerarquía de Usuarios / {rolSeleccionado}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={resetearRol} className="p-4 rounded-2xl border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all active:scale-90">
            <RotateCcw size={20} />
          </button>
          <button onClick={guardarConfiguracion} className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-2 hover:bg-black shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest">
            <Save size={18} /> Aplicar Cambios
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR: SELECTOR DE ROL */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Perfiles Disponibles</h3>
          {Object.keys(rolesConfig).map((rol) => {
            const isActive = rolSeleccionado === rol;
            return (
              <button
                key={rol}
                onClick={() => setRolSeleccionado(rol)}
                className={`w-full p-5 rounded-[1.5rem] text-left transition-all border-2 flex items-center justify-between ${
                  isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {rol === 'admin' ? <ShieldCheck size={22} /> : rol === 'supervisor' ? <Shield size={22} className={!isActive && 'text-amber-500'}/> : <Lock size={22} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black uppercase text-xs tracking-widest">{rol}</span>
                    <span className={`text-[8px] font-bold uppercase ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {rol === 'admin' ? 'Control Total' : rol === 'supervisor' ? 'Gestión Intermedia' : 'Acceso Limitado'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN: PANEL DE PERMISOS */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
          <div className="mb-8 flex items-center justify-between border-b border-slate-50 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Edit3 size={24} />
              </div>
              <div>
                <h2 className="font-black text-slate-800 text-lg uppercase italic leading-none">Matriz de Acceso: {rolSeleccionado}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configura privilegios individuales por módulo</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {modulos.map((modulo) => {
              const currentPerm = rolesConfig[rolSeleccionado].modules[modulo.id];
              return (
                <div key={modulo.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:border-indigo-100 transition-all">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className={`p-3 rounded-2xl transition-all ${
                      currentPerm === 'none' ? 'bg-red-50 text-red-500' : 
                      currentPerm === 'view' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      {currentPerm === 'none' ? <Lock size={20} /> : currentPerm === 'view' ? <Eye size={20} /> : <ShieldCheck size={20} />}
                    </div>
                    <div>
                      <p className="font-black text-slate-700 text-xs uppercase tracking-tight">{modulo.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{modulo.desc}</p>
                    </div>
                  </div>

                  <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                    <button onClick={() => cambiarPermiso(modulo.id, 'none')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${getBtnStyle(modulo.id, 'none')}`}>
                      Bloqueado
                    </button>
                    <button onClick={() => cambiarPermiso(modulo.id, 'view')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${getBtnStyle(modulo.id, 'view')}`}>
                      Ver
                    </button>
                    <button onClick={() => cambiarPermiso(modulo.id, 'full')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${getBtnStyle(modulo.id, 'full')}`}>
                      Full
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {rolSeleccionado === 'admin' && (
            <div className="mt-8 p-4 bg-indigo-50 rounded-2xl flex items-center gap-3 border border-indigo-100">
              <AlertCircle size={18} className="text-indigo-600" />
              <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-tight">El Administrador siempre mantiene acceso de recuperación total.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesManager;