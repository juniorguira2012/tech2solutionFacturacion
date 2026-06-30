import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Save, CheckCircle, Lock, Eye, Edit3, RotateCcw, ShieldCheck, AlertCircle, Plus, Trash2, AlertTriangle, FilePlus, FilePen, FileX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUsuarios } from '../context/UsuariosContext';

const RolesManager = () => {
  const { usuario } = useAuth();
  const { recargarRoles } = useUsuarios();
  
  const [rolesConfig, setRolesConfig] = useState({});
  const [rolSeleccionado, setRolSeleccionado] = useState('');
  const [toast, setToast] = useState(false);
  const [newRoleModal, setNewRoleModal] = useState({ show: false, name: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, rol: null });
  const [loading, setLoading] = useState(true);

  const defaultPermissions = { view: false, create: false, edit: false, delete: false };

  const modulos = [
    { id: 'ventas', nombre: 'Módulo de Ventas', desc: 'Acceso al POS y facturación', actions: ['view', 'create', 'edit', 'delete'] },
    { id: 'inventario', nombre: 'Módulo de Inventario', desc: 'Control de productos, stock y movimientos', actions: ['view', 'create', 'edit', 'delete'] },
    { id: 'clientes', nombre: 'Gestión de Clientes', desc: 'Control sobre la cartera de clientes', actions: ['view', 'create', 'edit', 'delete'] },
    { id: 'reportes', nombre: 'Reportes y Analíticas', desc: 'Visualización de KPIs y datos comerciales', actions: ['view'] },
    { id: 'configuracion', nombre: 'Configuración del Sistema', desc: 'Acceso a Usuarios, Roles y ajustes globales', actions: ['view', 'create', 'edit', 'delete'] },
  ];

  const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('inventario.oneredrd.com') 
    ? '/api' 
    : (import.meta.env.VITE_API_URL || '/api');

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`);
      if (res.ok) {
        const data = await res.json();
        const configMap = {};
        
        data.forEach(r => { 
          configMap[r.name] = r.config; 
        });

        if (Object.keys(configMap).length === 0 || !configMap['admin']) {
          configMap['admin'] = {
            modules: Object.fromEntries(modulos.map(m => [m.id, { view: true, create: true, edit: true, delete: true }])),
            viewScope: 'all'
          };
        }
        
        setRolesConfig(configMap);
        
        const primerosRoles = Object.keys(configMap);
        if (primerosRoles.length > 0) {
          setRolSeleccionado(primerosRoles.includes('admin') ? 'admin' : primerosRoles[0]);
        }
      }
    } catch (error) {
      console.error("Error al cargar roles de la DB:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const guardarConfiguracion = async () => {
    if (!rolSeleccionado) return;
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

  // 🌟 FUNCIÓN REINCORPORADA: Abre el modal para setear el nombre del nuevo perfil
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
        modules: Object.fromEntries(modulos.map(m => [m.id, {...defaultPermissions}])),
        viewScope: 'own'
      }
    }));
    
    setRolSeleccionado(key);
    setNewRoleModal({ show: false, name: '' });
  };

  const ejecutarEliminacion = async (rolABorrar) => {
    if (rolABorrar === 'admin') return;
    try {
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
      
      const restantes = Object.keys(nuevaConfig);
      setRolSeleccionado(restantes.includes('admin') ? 'admin' : restantes[0] || '');
      setDeleteModal({ show: false, rol: null });
    } catch (error) {
      setDeleteModal({ show: false, rol: null });
    }
  };

  const handlePermissionChange = (moduleId, action, isChecked) => {
    if (!rolSeleccionado || !rolesConfig[rolSeleccionado]) return;

    setRolesConfig(prev => {
      const targetRole = prev[rolSeleccionado];
      const currentModules = targetRole.modules || {};
      const currentModulePerms = currentModules[moduleId] || { ...defaultPermissions };

      const updatedPerms = { ...currentModulePerms, [action]: isChecked };

      if (action === 'view' && !isChecked) {
        updatedPerms.create = false;
        updatedPerms.edit = false;
        updatedPerms.delete = false;
      }

      if (action !== 'view' && isChecked) {
        updatedPerms.view = true;
      }

      return {
        ...prev,
        [rolSeleccionado]: {
          ...targetRole,
          modules: { ...currentModules, [moduleId]: updatedPerms }
        }
      };
    });
  };

  const actionIcons = {
    view: <Eye size={16} />,
    create: <FilePlus size={16} />,
    edit: <FilePen size={16} />,
    delete: <FileX size={16} />,
  };

  if (loading) {
    return <div className="p-10 text-center font-black text-xs tracking-widest text-slate-400 uppercase">Sincronizando con Base de Datos...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-slate-700 animate-in slide-in-from-right-5">
          <CheckCircle size={20} className="text-emerald-400" />
          <span className="font-black text-xs uppercase tracking-widest">Cambios Guardados en DB</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Seguridad del Sistema</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-brand">Jerarquía Real / {rolSeleccionado || 'Ninguno'}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchRoles} className="p-4 rounded-2xl border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all active:scale-90" title="Recargar de la DB">
            <RotateCcw size={20} />
          </button>
          <button onClick={guardarConfiguracion} disabled={!rolSeleccionado} className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-2 hover:bg-black shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest disabled:opacity-30">
            <Save size={18} /> Guardar Cambios
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR: PERFILES */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between ml-2 mb-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfiles de la DB</h3>
            <button onClick={agregarNuevoRol} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase shadow-md hover:bg-indigo-700 transition-all">
              <Plus size={14} /> Nuevo Perfil
            </button>
          </div>
          {Object.keys(rolesConfig).map((rol) => {
            const isActive = rolSeleccionado === rol;
            return (
              <button
                key={rol}
                type="button"
                onClick={() => setRolSeleccionado(rol)}
                className={`w-full p-5 rounded-[1.5rem] text-left transition-all border-2 flex items-center justify-between ${
                  isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {rol === 'admin' ? <ShieldCheck size={22} /> : <Lock size={22} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black uppercase text-xs tracking-widest">{rol}</span>
                    <span className={`text-[8px] font-bold uppercase ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {rol === 'admin' ? 'Acceso Maestro' : 'Rol Personalizado'}
                    </span>
                  </div>
                </div>
                
                {rol !== 'admin' && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); setDeleteModal({ show: true, rol }); }}
                    className={`p-2 rounded-xl transition-all ${isActive ? 'hover:bg-white/20 text-indigo-200' : 'hover:bg-rose-50 text-slate-300 hover:text-rose-500'}`}
                  >
                    <Trash2 size={16} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* PANEL PRINCIPAL MATRIZ */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
          {rolSeleccionado && rolesConfig[rolSeleccionado] ? (
            <>
              <div className="mb-8 flex items-center justify-between border-b border-slate-50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Edit3 size={24} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-800 text-lg uppercase italic leading-none">Matriz de Acceso: {rolSeleccionado}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Modificando esquema real en memoria</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {modulos.map((modulo) => {
                  const currentPerms = { ...defaultPermissions, ...(rolesConfig[rolSeleccionado]?.modules?.[modulo.id] || {}) };
                  const hasAnyPermission = Object.values(currentPerms).some(p => p === true);

                  return (
                    <div key={modulo.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className={`p-3 rounded-2xl transition-all ${!hasAnyPermission ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                          {!hasAnyPermission ? <Lock size={20} /> : <ShieldCheck size={20} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-700 text-xs uppercase tracking-tight">{modulo.nombre}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{modulo.desc}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                        {modulo.actions.map(action => (
                          <label key={action} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                              checked={currentPerms[action] || false}
                              onChange={(e) => handlePermissionChange(modulo.id, action, e.target.checked)}
                              disabled={rolSeleccionado === 'admin'}
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500">{actionIcons[action]}</span>
                              <span className="text-[9px] font-black uppercase text-slate-600">{action}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest">
              Selecciona o crea un perfil para ver su configuración
            </div>
          )}
        </div>
      </div>

      {/* MODAL ELIMINAR */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full shadow-2xl text-center">
            <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">¿Eliminar Perfil?</h2>
            <p className="text-slate-500 font-bold mt-4 text-sm">Estás a punto de borrar el perfil <span className="text-rose-500 uppercase">"{deleteModal.rol}"</span> de la base de datos de manera definitiva.</p>
            <div className="flex gap-3 mt-10">
              <button onClick={() => setDeleteModal({ show: false, rol: null })} className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
              <button onClick={() => ejecutarEliminacion(deleteModal.rol)} className="flex-1 px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Eliminar de DB</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO PERFIL */}
      {newRoleModal.show && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full shadow-2xl">
            <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Shield size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter text-center">Nuevo Perfil</h2>
            <p className="text-slate-400 font-bold mt-2 text-center text-[10px] uppercase tracking-widest mb-8">Crea la estructura del nuevo rol</p>
            <input autoFocus type="text" value={newRoleModal.name} onChange={(e) => setNewRoleModal({...newRoleModal, name: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-sm text-slate-700" placeholder="Ej: supervisor, vendedor, auditor..." onKeyDown={(e) => e.key === 'Enter' && newRoleModal.name.trim() && confirmarNuevoRol()} />
            <div className="flex gap-3 mt-10">
              <button onClick={() => setNewRoleModal({ show: false, name: '' })} className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
              <button onClick={confirmarNuevoRol} disabled={!newRoleModal.name.trim()} className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl disabled:opacity-30">Crear Perfil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManager;