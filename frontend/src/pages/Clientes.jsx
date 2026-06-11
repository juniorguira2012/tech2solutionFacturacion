import React, { useState, useMemo } from 'react';
import { UserPlus, Search, Edit3, Trash2, MapPin, Phone, Mail, X, FileText, Globe, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useClientes } from '../context/ClienteContext';
import { useAuth } from '../context/AuthContext'; // Importamos Auth para los permisos

// Modal de Confirmación Estilizado
const ConfirmModal = ({ isOpen, onConfirm, onCancel, titulo, descripcion, tipo = 'danger' }) => {
  if (!isOpen) return null;
  const esEliminar = tipo === 'danger';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`flex justify-center pt-8 pb-4`}>
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${esEliminar ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle size={32} className={esEliminar ? 'text-red-500' : 'text-amber-500'} />
          </div>
        </div>
        <div className="px-8 pb-6 text-center space-y-2">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">{titulo}</h3>
          <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{descripcion}</p>
        </div>
        <div className="flex border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors border-r border-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-white transition-colors ${
              esEliminar ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {esEliminar ? 'Eliminar' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Clientes = () => {
  const { clientes, loading, agregarCliente, actualizarCliente, eliminarCliente } = useClientes();
  const { usuario } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState({ show: false, mensaje: '', tipo: 'success' });
  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ show: true, mensaje, tipo });
    setTimeout(() => setToast({ show: false, mensaje: '', tipo: 'success' }), 3000);
  };

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
  
  const [formData, setFormData] = useState({
    nombre: '', rnc: '', telefono: '', direccion: '', zona: '', email: '', categoria: 'Bronce'
  });

  // --- 1. LÓGICA DE PERMISOS PARA CLIENTES ---
  // Obtenemos el permiso directamente del usuario logueado
  const permisoClientes = usuario?.rol === 'admin' ? 'full' : (usuario?.permisos?.modules?.clientes || 'none');

  const clientesFiltrados = useMemo(() => {
    const busqueda = searchTerm.trim().toLowerCase();

    return clientes
      .filter(c => c.isActive !== false)
      .filter(c => {
        if (!busqueda) return true;

        return (
          (c.nombre || '').toLowerCase().includes(busqueda) ||
          (c.rnc || '').toLowerCase().includes(busqueda) ||
          (c.email || '').toLowerCase().includes(busqueda) ||
          (c.zona || '').toLowerCase().includes(busqueda)
        );
      });
  }, [clientes, searchTerm]);

  // Bloqueo total si el permiso es 'none'
  if (permisoClientes === 'none') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-200">
          <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Acceso Privado</h2>
          <p className="text-slate-400 font-medium mt-2 max-w-xs">Tu perfil no tiene autorización para ver la cartera de clientes.</p>
        </div>
      </div>
    );
  }

  // --- FUNCIÓN DE EXPORTACIÓN ---
  const exportarAExcel = () => {
    if (clientes.length === 0) return alert("No hay datos para exportar");
    const encabezados = ["Nombre", "RNC/Cedula", "Telefono", "Email", "Direccion", "Zona", "Categoria"];
    const filas = clientes.map(c => [
      `"${c.nombre}"`, 
      `"${c.rnc || ''}"`, 
      `"${c.telefono || ''}"`, 
      `"${c.email || ''}"`, 
      `"${c.direccion || ''}"`,
      `"${c.zona || ''}"`,
      `"${c.categoria || 'Bronce'}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encabezados.join(",") + "\n" + filas.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clientes_OneRedRD_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEliminarCliente = (cliente) => { // Renombrado para evitar confusión
    if (cliente.id === 1) {
      mostrarToast("No puedes eliminar al Consumidor Final", "error");
      return;
    }

    setConfirm({
      isOpen: true,
      titulo: '¿Eliminar Cliente?',
      descripcion: `¿Estás seguro de que deseas eliminar a "${cliente.nombre}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      onConfirm: async () => {
        try {
          const exito = await eliminarCliente(cliente.id); // Esta función ahora lanza errores
          if (exito) mostrarToast("Cliente eliminado", "success");
        } catch (error) {
          console.error("Error al eliminar:", error);
          mostrarToast(error.message || "Error al eliminar cliente", "error");
        }
        cerrarConfirm();
      }
    });
  };

  const getBadgeColor = (cat) => {
    switch (cat) {
      case 'Diamante': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Oro': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Plata': return 'bg-slate-200 text-slate-700 border-slate-300';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (permisoClientes !== 'full') return;
    try {
      if (isEditing) {
        await actualizarCliente(formData);
        mostrarToast("Ficha actualizada");
      } else {
        await agregarCliente(formData);
        mostrarToast("Cliente registrado");
      }
      cerrarModal();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      mostrarToast(error.message || "No se pudo guardar el cliente", "error");
    }
  };

  const abrirEditar = (cliente) => {
    if (permisoClientes !== 'full') return;
    setFormData(cliente);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ nombre: '', rnc: '', telefono: '', direccion: '', zona: '', email: '', categoria: 'Bronce' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Clientes</h1>
          <p className="text-slate-500 font-medium">Gestión de niveles y datos de facturación.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={exportarAExcel}
            className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            <FileText size={18} /> <span className="hidden md:inline">Exportar</span>
          </button>
          
          {permisoClientes === 'full' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-brand text-white px-5 py-3 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              <UserPlus size={18} /> <span className="hidden md:inline">Nuevo Cliente</span>
            </button>
          )}
        </div>
      </header>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, RNC, zona o correo..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {permisoClientes === 'view' && (
           <div className="hidden md:flex items-center gap-2 text-brand bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 italic font-black text-[10px] uppercase ml-4">
             <Lock size={14} /> Consulta de Clientes
           </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-medium">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-black tracking-[0.2em]">
            <tr>
              <th className="px-6 py-4">Cliente / RNC</th>
              <th className="px-6 py-4">Categoría / Zona</th>
              <th className="px-6 py-4">Contacto / Email</th>
              <th className="px-6 py-4">Dirección</th>
              {permisoClientes === 'full' && <th className="px-6 py-4 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading && (
              <tr>
                <td colSpan={permisoClientes === 'full' ? 5 : 4} className="px-6 py-12 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Cargando clientes...</span>
                </td>
              </tr>
            )}

            {!loading && clientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={permisoClientes === 'full' ? 5 : 4} className="px-6 py-12 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">No hay clientes para mostrar</span>
                </td>
              </tr>
            )}

            {!loading && clientesFiltrados.map(cliente => (
              <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-700 uppercase text-xs">{cliente.nombre}</span>
                    <span className="text-[10px] text-slate-400 font-mono italic font-bold">RNC: {cliente.rnc || '---'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className={`w-fit px-3 py-0.5 rounded-full text-[9px] font-black uppercase border ${getBadgeColor(cliente.categoria)}`}>
                      {cliente.categoria || 'Bronce'}
                    </span>
                    <span className="flex items-center gap-1 font-black text-slate-400 text-[9px] uppercase tracking-tighter">
                        <Globe size={10}/> {cliente.zona || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold">
                  <div className="flex flex-col text-slate-600">
                    <span className="flex items-center gap-1.5 text-xs font-black"><Phone size={12} className="text-slate-300"/> {cliente.telefono}</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 lowercase italic font-medium"><Mail size={12}/> {cliente.email || '---'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-[200px]">
                  <div className="flex items-start gap-2 text-slate-500">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0 text-slate-300" />
                    <span className="text-[11px] line-clamp-2 leading-tight font-bold italic uppercase">
                      {cliente.direccion || <span className="italic text-slate-200">No registrada</span>}
                    </span>
                  </div>
                </td>
                
                {permisoClientes === 'full' && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => abrirEditar(cliente)} 
                        className="p-2 text-slate-400 hover:text-brand hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all shadow-sm"
                      >
                        <Edit3 size={18}/>
                      </button>
                      <button 
                        onClick={() => handleEliminarCliente(cliente)} // Llamada a la función corregida
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal - Solo si es Full */}
      {isModalOpen && permisoClientes === 'full' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 text-slate-800">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 tracking-tighter italic uppercase">{isEditing ? 'Actualizar Ficha' : 'Nuevo Cliente'}</h2>
              <button onClick={cerrarModal} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 shadow-sm transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Nombre Completo</label>
                  <input required className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-sm"
                    value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">RNC / Cédula</label>
                  <input className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-sm"
                    value={formData.rnc} onChange={(e) => setFormData({...formData, rnc: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Teléfono</label>
                  <input className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-sm"
                    value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Correo Electrónico</label>
                  <input type="email" className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-sm"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Zona / Sector</label>
                  <input className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-sm"
                    value={formData.zona} onChange={(e) => setFormData({...formData, zona: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Dirección Exacta</label>
                  <textarea rows="2" className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all resize-none font-bold text-sm"
                    value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
                </div>

                <div className="col-span-2 pt-2">
                  <label className="block text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-widest ml-1">Nivel del Cliente</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Bronce', 'Plata', 'Oro', 'Diamante'].map(nivel => (
                      <button
                        key={nivel}
                        type="button"
                        onClick={() => setFormData({...formData, categoria: nivel})}
                        className={`py-2 text-[10px] font-black rounded-xl border transition-all uppercase ${
                          formData.categoria === nivel 
                          ? 'bg-brand text-white border-brand shadow-lg' 
                          : 'bg-white text-slate-400 border-slate-200 hover:border-brand/40'
                        }`}
                      >
                        {nivel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-brand transition-all mt-6 uppercase tracking-widest text-xs">
                {isEditing ? 'Confirmar Actualización' : 'Registrar Cliente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación elegante */}
      <ConfirmModal
        isOpen={confirm.isOpen}
        titulo={confirm.titulo}
        descripcion={confirm.descripcion}
        tipo={confirm.tipo}
        onConfirm={confirm.onConfirm}
        onCancel={cerrarConfirm}
      />

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-[200] p-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300 ${
          toast.tipo === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="text-[10px] font-black uppercase tracking-widest">{toast.mensaje}</p>
        </div>
      )}
    </div>
  );
};

export default Clientes;
