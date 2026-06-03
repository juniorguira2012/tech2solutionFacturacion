import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Save, CheckCircle, Lock, Eye, Edit3, RotateCcw, ShieldCheck, AlertCircle, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUsuarios } from '../context/UsuariosContext';

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

  const { usuario } = useAuth();
  const { recargarRoles } = useUsuarios();
  const [rolesConfig, setRolesConfig] = useState(initialRoles);
  const [rolSeleccionado, setRolSeleccionado] = useState('vendedor');
  const [toast, setToast] = useState(false);
  const [newRoleModal, setNewRoleModal] = useState({ show: false, name: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, rol: null });
  const [loading, setLoading] = useState(true);

  // Sincronizamos la URL con la lógica global del sistema
  const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('inventario.oneredrd.com') 
    ? '/api' 
    : (import.meta.env.VITE_API_URL || '/api');

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`);
      if (res.ok) {
        const data = await res.json();
        const configMap = {};
        data.forEach(r => { configMap[r.name] = r.config; });
        // Sobrescribimos la configuración local con la de la base de datos
        setRolesConfig(prev => ({ ...prev, ...configMap }));
      }
    } catch (error) {
      console.error("Error al cargar roles:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const modulos = [
    { id: 'ventas', nombre: 'Módulo de Ventas', desc: 'Facturación e historial' },
    { id: 'inventario', nombre: 'Inventario', desc: 'Stock y productos' },
    { id: 'reportes', nombre: 'Reportes y KPI', desc: 'Ingresos y analíticas' },
    { id: 'clientes', nombre: 'Gestión de Clientes', desc: 'Base de datos' }
  ];

  const guardarConfiguracion = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles/update-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': usuario?.id || '',
          'x-user-role': usuario?.rol || ''
        },
        body: JSON.stringify({ name: rolSeleccionado, config: rolesConfig[rolSeleccionado] })
      });
      if (!res.ok) throw new Error("Error al guardar");
      await recargarRoles();
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (error) {
      alert("No se pudo guardar la configuración en la base de datos.");
    }
  };

  const resetearRol = () => {
    setRolesConfig({
      ...rolesConfig,
      [rolSeleccionado]: initialRoles[rolSeleccionado] || { 
        modules: { ventas: 'none', inventario: 'none', reportes: 'none', clientes: 'none' },
        viewScope: 'own' 
      }
    });
  };

  const agregarNuevoRol = () => {
    setNewRoleModal({ show: true, name: '' });
  };

  const confirmarNuevoRol = () => {
    const nombre = newRoleModal.name;
    if (!nombre || nombre.trim() === "") return;
    
    const key = nombre.toLowerCase().trim().replace(/\s+/g, '_');
    setRolesConfig(prev => ({
      ...prev,
      [key]: {
        modules: { ventas: 'none', inventario: 'none', reportes: 'none', clientes: 'none' },
        viewScope: 'own'
      }
    }));
    setRolSeleccionado(key);
    setNewRoleModal({ show: false, name: '' });
  };

  const ejecutarEliminacion = async () => {
    const rolABorrar = deleteModal.rol;
    if (rolABorrar === 'admin') return;

    try {
      // Opcional: Intentar borrar en backend si existe el endpoint
      await fetch(`${API_BASE_URL}/roles/${rolABorrar}`, { 
        method: 'DELETE',
        headers: { 
          'x-user-id': usuario?.id || '',
          'x-user-role': usuario?.rol || '' 
        }
      });

      const nuevaConfig = { ...rolesConfig };
      delete nuevaConfig[rolABorrar];
      setRolesConfig(nuevaConfig);
      await recargarRoles();
      
      if (rolSeleccionado === rolABorrar) {
        setRolSeleccionado('vendedor');
      }
      setDeleteModal({ show: false, rol: null });
    } catch (error) {
      setDeleteModal({ show: false, rol: null });
    }
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
          <div className="flex items-center justify-between ml-2 mb-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfiles Disponibles</h3>
            <button 
              onClick={agregarNuevoRol}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-indigo-600 transition-all active:scale-95"
            >
              <Plus size={14} /> Nuevo Perfil
            </button>
          </div>
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
                
                {/* Botón Eliminar (Solo si no es admin) */}
                {rol !== 'admin' && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal({ show: true, rol });
                    }}
                    className={`p-2 rounded-xl transition-all ${isActive ? 'hover:bg-white/20 text-indigo-200' : 'hover:bg-rose-50 text-slate-300 hover:text-rose-500'}`}
                  >
                    <Trash2 size={16} />
                  </div>
                )}
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

      {/* VENTANA DE CONFIRMACIÓN ESTILIZADA */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20 text-center">
            <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <AlertTriangle size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight">¿Eliminar Perfil?</h2>
            <p className="text-slate-500 font-bold mt-4 leading-relaxed text-sm">
              Estás a punto de borrar el perfil <span className="text-rose-500 uppercase">"{deleteModal.rol}"</span>. 
              Esta acción no se puede deshacer y afectará a los usuarios vinculados.
            </p>
            
            <div className="flex gap-3 mt-10">
              <button 
                onClick={() => setDeleteModal({ show: false, rol: null })}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={ejecutarEliminacion}
                className="flex-1 px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 shadow-xl shadow-rose-100 transition-all active:scale-95"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR NUEVO PERFIL (SUSTITUYE AL PROMPT) */}
      {newRoleModal.show && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="h-20 w-20 bg-indigo-50 text-brand rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Shield size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight text-center">Nuevo Perfil</h2>
            <p className="text-slate-400 font-bold mt-2 text-center text-[10px] uppercase tracking-widest mb-8">Define el nombre del nivel de acceso</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del Perfil</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newRoleModal.name} 
                  onChange={(e) => setNewRoleModal({...newRoleModal, name: e.target.value})}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm text-slate-700 transition-all focus:bg-white focus:shadow-sm" 
                  placeholder="Ej: Auditor, Supervisor Nocturno..."
                  onKeyDown={(e) => e.key === 'Enter' && newRoleModal.name.trim() && confirmarNuevoRol()}
                />
              </div>
              {rolesConfig[newRoleModal.name.toLowerCase().trim().replace(/\s+/g, '_')] && (
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-tighter ml-2 italic">⚠️ Este nombre de perfil ya existe.</p>
              )}
            </div>
            
            <div className="flex gap-3 mt-10">
              <button 
                onClick={() => setNewRoleModal({ show: false, name: '' })}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarNuevoRol}
                disabled={!newRoleModal.name.trim() || rolesConfig[newRoleModal.name.toLowerCase().trim().replace(/\s+/g, '_')]}
                className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                Crear Perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManager;
