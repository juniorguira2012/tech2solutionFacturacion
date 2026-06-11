import React, { useState } from 'react';
import { 
  UserPlus, Trash2, ArrowLeft, 
  CheckCircle, X, Edit2, KeyRound, Power, Shield, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUsuarios } from '../context/UsuariosContext'; // Importamos el contexto de DB

// Modal de Confirmación Estilizado
const ConfirmModal = ({ isOpen, onConfirm, onCancel, titulo, descripcion, tipo = 'danger' }) => {
  if (!isOpen) return null;
  const esEliminar = tipo === 'danger';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className={`flex justify-center pt-10 pb-4`}>
          <div className={`h-20 w-20 rounded-3xl flex items-center justify-center ${esEliminar ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle size={40} className={esEliminar ? 'text-red-500' : 'text-amber-500'} />
          </div>
        </div>
        <div className="px-10 pb-8 text-center space-y-2">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">{titulo}</h3>
          <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">{descripcion}</p>
        </div>
        <div className="flex border-t border-slate-100">
          <button onClick={onCancel} className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-colors border-r border-slate-100">
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors ${
              esEliminar ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {esEliminar ? 'Confirmar' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Usuarios = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { usuarios, roles, agregarUsuario, actualizarUsuario, eliminarUsuario } = useUsuarios();
  
  // 1. ESTADOS PRINCIPALES
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, mensaje: "", tipo: 'success' });

  const [confirm, setConfirm] = useState({
    isOpen: false,
    titulo: '',
    descripcion: '',
    tipo: 'danger',
    onConfirm: null,
  });

  const cerrarConfirm = () => {
    setConfirm({ isOpen: false, titulo: '', descripcion: '', tipo: 'danger', onConfirm: null });
  };

  // --- CONTROL DE SEGURIDAD NIVEL 0 ---
  // Si el usuario no es admin, bloqueamos el renderizado inmediatamente
  const esAdmin = usuario?.rol === 'admin';

  const rolesDinámicos = roles.length > 0 
    ? roles.map(r => ({
        id: r.name,
        nombre: r.name.charAt(0).toUpperCase() + r.name.slice(1)
      }))
    : [
        { id: 'admin', nombre: 'Administrador' },
        { id: 'supervisor', nombre: 'Supervisor' },
        { id: 'vendedor', nombre: 'Vendedor' },
        { id: 'cajero', nombre: 'Cajero' }
      ];

  const nuevoUsuario = { 
    nombre: '', email: '', password: '', rol: 'vendedor', isActive: true
  };

  const [formUsuario, setFormUsuario] = useState({ ...nuevoUsuario });

  // Si no es admin, mostramos pantalla de error de seguridad
  if (!esAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in duration-300">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-200 text-center max-w-lg">
          <div className="h-24 w-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Shield size={48} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Acceso Denegado</h2>
          <p className="text-slate-500 font-bold mt-4 leading-relaxed">
            Esta sección contiene datos sensibles de seguridad. Solo el personal de administración puede gestionar cuentas de acceso.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="mt-8 flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand transition-all mx-auto"
          >
            <ArrowLeft size={16} /> Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ show: true, mensaje, tipo });
    setTimeout(() => setToast({ show: false, mensaje: "", tipo: 'success' }), 3000);
  };

  const prepararEdicion = (user) => {
    setEditandoId(user.id);
    setFormUsuario({
      nombre: user.nombre,
      email: user.email,
      password: '', // Importante: dejar vacío para indicar que no hay cambio de clave por defecto
      rol: user.rol,
      isActive: user.isActive ?? true
    });
    setShowModal(true);
  };

  const toggleEstadoRapido = async (user) => {
    if (user.id === 1 || user.id === usuario.id) return;
    try {
      await actualizarUsuario({ ...user, isActive: !user.isActive });
      mostrarToast(`Usuario ${!user.isActive ? 'activado' : 'suspendido'}`);
    } catch {
      mostrarToast("Error al cambiar estado", "error");
    }
  };

  const handleEliminarClick = (user) => {
    const SUPER_USER_EMAIL = 'techtwosolution2@gmail.com';
    
    if (user.id === usuario?.id) {
      mostrarToast("No puedes eliminarte a ti mismo", "error");
      return;
    }

    if (user.rol === 'admin' && usuario?.email !== SUPER_USER_EMAIL) {
      mostrarToast("Solo el Super Usuario puede eliminar otros Admins", "error");
      return;
    }

    setConfirm({
      isOpen: true,
      titulo: '¿Desactivar Usuario?',
      descripcion: `"${user.nombre}" no podrá entrar al sistema, pero su historial se conservará en la base de datos.`,
      tipo: 'danger',
      onConfirm: async () => {
        const exito = await eliminarUsuario(user.id);
        if (exito) {
          mostrarToast("Usuario desactivado correctamente");
        } else {
          mostrarToast("No se pudo desactivar el usuario", "error");
        }
        cerrarConfirm();
      }
    }
    );
  }; 
  const guardarUsuario = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (editandoId) {
        // Clonamos los datos y eliminamos el password si está vacío
        const datosActualizados = { ...formUsuario, id: editandoId };
        if (!datosActualizados.password || datosActualizados.password.trim() === "") {
          delete datosActualizados.password;
        }
        await actualizarUsuario(datosActualizados);
        mostrarToast("Usuario actualizado correctamente");
      } else {
        await agregarUsuario(formUsuario);
        mostrarToast(`Acceso creado para ${formUsuario.email}`);
      }
      setIsSaving(false);
      setShowModal(false);
      setEditandoId(null);
      setFormUsuario({ ...nuevoUsuario });
    } catch (err) {
      setIsSaving(false);
      mostrarToast(err.message || "Error al procesar usuario");
    }
  };

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {toast.show && (
        <div className={`fixed top-10 right-10 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-[210] border animate-in slide-in-from-right-5 ${toast.tipo === 'success' ? 'bg-slate-900 border-slate-700' : 'bg-red-600 border-red-500'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${toast.tipo === 'success' ? 'bg-emerald-500' : 'bg-white/20'}`}>
            <CheckCircle size={18} className="text-white" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">{toast.mensaje}</span>
        </div>
      )}

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/')} className="h-14 w-14 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 shadow-sm flex items-center justify-center">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">Cuentas de Acceso</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <Shield size={12} className="text-brand" /> Control de Seguridad 
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/roles')} 
            className="bg-white text-slate-600 border border-slate-200 px-6 py-4 rounded-[1.5rem] font-black flex items-center gap-3 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest shadow-sm"
          >
            <Shield size={18} className="text-slate-400" /> Roles
          </button>
          <button 
            onClick={() => { setEditandoId(null); setFormUsuario({ ...nuevoUsuario }); setShowModal(true); }} 
            className="bg-brand text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            <UserPlus size={18} /> Nuevo Registro
          </button>
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel / Rol</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
              {usuarios.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50/30 transition-colors group ${!user.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm border-2 transition-all ${user.isActive ? 'bg-brand/5 border-brand/10 text-brand group-hover:bg-brand group-hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                        {user.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm italic uppercase tracking-tight">{user.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest lowercase">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      user.rol === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <button 
                      onClick={() => toggleEstadoRapido(user)}
                      className={`mx-auto flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                        user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                      <span className="text-[9px] font-black uppercase tracking-widest">{user.isActive ? 'activo' : 'inactivo'}</span>
                    </button>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button onClick={() => prepararEdicion(user)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-indigo-50 hover:text-brand transition-all">
                         <Edit2 size={18} />
                      </button>
                      {user.id !== 1 && user.id !== usuario.id && (
                        <button onClick={() => handleEliminarClick(user)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] p-12 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">
                  {editandoId ? 'Editar Perfil' : 'Alta de Usuario'}
                </h2>
                <div className="h-1.5 w-12 bg-brand rounded-full mt-2"></div>
              </div>
              <button onClick={() => setShowModal(false)} className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={guardarUsuario} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Completo</label>
                  <input required value={formUsuario.nombre} onChange={e => setFormUsuario({...formUsuario, nombre: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm text-slate-700 transition-all focus:bg-white focus:shadow-sm" placeholder="Ej. Juan Perez" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email de Acceso</label>
                  <input required type="email" value={formUsuario.email} onChange={e => setFormUsuario({...formUsuario, email: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm text-slate-700 transition-all focus:bg-white focus:shadow-sm" placeholder="usuario@one-red.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contraseña</label>
                    <div className="relative">
                      <input required={!editandoId} type="password" value={formUsuario.password} onChange={e => setFormUsuario({...formUsuario, password: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm text-slate-700 transition-all focus:bg-white focus:shadow-sm" />
                      <KeyRound className="absolute right-5 top-5 text-slate-300" size={18} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nivel (Rol)</label>
                    <select value={formUsuario.rol} onChange={e => setFormUsuario({...formUsuario, rol: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-black text-[10px] uppercase text-slate-700 bg-white transition-all cursor-pointer">
                      {rolesDinámicos.map(rol => (
                        <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 mt-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${formUsuario.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                      <Power size={20} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-800 uppercase tracking-widest">Estatus de Cuenta</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase italic">¿Puede entrar al sistema?</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormUsuario({...formUsuario, isActive: !formUsuario.isActive})}
                    className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${formUsuario.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 bg-white h-5 w-5 rounded-full shadow-md transition-all ${formUsuario.isActive ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-brand transition-all uppercase text-xs tracking-[0.3em] mt-8 active:scale-95 flex items-center justify-center gap-3">
                {isSaving ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  editandoId ? 'Actualizar Credenciales' : 'Habilitar Nuevo Usuario'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirm.isOpen}
        titulo={confirm.titulo}
        descripcion={confirm.descripcion}
        tipo={confirm.tipo}
        onConfirm={confirm.onConfirm}
        onCancel={cerrarConfirm}
      />
    </div>
  );
};

export default Usuarios;
