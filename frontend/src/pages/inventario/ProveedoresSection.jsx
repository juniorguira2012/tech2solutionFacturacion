import React, { useState } from 'react';
import { Truck, Plus, Search, Edit3, Trash2, X, Phone, Mail, Globe, MapPin } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';

const ProveedoresSection = ({ mostrarToast, permisos }) => { // 🛡️ 1. Recibimos los permisos
  const { proveedores, agregarProveedor, actualizarProveedor, eliminarProveedor } = useInventario();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [formData, setFormData] = useState({ id: null, nombre: '', rnc: '', telefono: '', correo: '', direccion: '', ofrece: '', categoria: 'Estándar' });

  const abrirModalParaCrear = () => {
    if (!permisos?.create) return mostrarToast('No tienes permiso para crear proveedores', 'error');
    setIsEditing(false);
    setFormData({ id: null, nombre: '', rnc: '', telefono: '', correo: '', direccion: '', ofrece: '', categoria: 'Estándar' });
    setIsModalOpen(true);
  };

  const abrirModalParaEditar = (proveedor) => {
    if (!permisos?.edit) return mostrarToast('No tienes permiso para editar proveedores', 'error');
    setIsEditing(true);
    setFormData(proveedor);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // 🛡️ 2. Verificación de permisos de creación/edición
    if ((isEditing && !permisos?.edit) || (!isEditing && !permisos?.create)) {
      mostrarToast("No tienes permiso para realizar esta acción", "error");
      return;
    }
    try {
      if (isEditing) {
        await actualizarProveedor(formData);
        mostrarToast("Proveedor actualizado");
      } else {
        const { id, ...nuevoProv } = formData;
        await agregarProveedor(nuevoProv);
        mostrarToast("Proveedor registrado");
      }
      cerrarModal();
    } catch (err) {
      mostrarToast("Error al procesar proveedor", "error");
    }
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ id: null, nombre: '', rnc: '', telefono: '', correo: '', direccion: '', ofrece: '', categoria: 'Estándar' });
  };

  const handleDelete = (proveedor) => {
    if (!permisos?.delete) {
      return mostrarToast("No tienes permiso para eliminar proveedores", "error");
    }
    if (window.confirm(`¿Estás seguro de que deseas eliminar al proveedor "${proveedor.nombre}"?`)) {
      eliminarProveedor(proveedor.id)
        .then(exito => {
          if (exito) mostrarToast("Proveedor eliminado con éxito", "success");
        })
        .catch(err => mostrarToast(err.message || "No se pudo eliminar el proveedor", "error"));
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => 
    // Filtro General (Nombre o RNC)
    (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (p.rnc && p.rnc.includes(searchTerm))) &&
    // Filtro Específico por Servicio/Producto
    (serviceSearchTerm === "" || (p.ofrece && p.ofrece.toLowerCase().includes(serviceSearchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar por nombre o RNC..." className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand text-xs font-bold bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-brand" size={14} />
            <input 
              type="text" 
              placeholder="Filtrar por servicio (ej: Limpieza)..." 
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand text-xs font-bold bg-white italic" 
              value={serviceSearchTerm} 
              onChange={(e) => setServiceSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        {permisos?.create && ( // 🛡️ 3. Condicionamos el botón de "Nuevo Proveedor"
          <button onClick={abrirModalParaCrear} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-brand transition-all">
            <Plus size={16} /> Nuevo Proveedor
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {proveedoresFiltrados.map(prov => (
          <div key={prov.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 bg-indigo-50 text-brand rounded-xl flex items-center justify-center font-black">{prov.nombre.charAt(0)}</div>
              {(permisos?.edit || permisos?.delete) && ( // 🛡️ 4. Condicionamos los botones de acción
                <div className="flex gap-1">
                  {permisos?.edit && (
                    <button onClick={() => abrirModalParaEditar(prov)} className="p-2 text-slate-400 hover:text-brand hover:bg-indigo-50 rounded-lg transition-colors"><Edit3 size={16}/></button>
                  )}
                  {permisos?.delete && (
                    <button onClick={() => handleDelete(prov)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16}/>
                    </button>
                  )}
                </div>
              )}
            </div>
            <h3 className="font-black text-slate-800 uppercase text-xs mb-1">{prov.nombre}</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-2">RNC: {prov.rnc || '---'}</p>
            {prov.ofrece && (
              <div className="mb-4 flex items-center gap-1.5 px-3 py-1 bg-indigo-50/50 text-indigo-600 rounded-xl border border-indigo-100/50 w-fit">
                <Globe size={10} className="text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-wide italic truncate max-w-[150px]">{prov.ofrece}</span>
              </div>
            )}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><Phone size={12}/> {prov.telefono}</div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><Mail size={12}/> {prov.correo || '---'}</div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 truncate"><MapPin size={12}/> {prov.direccion || '---'}</div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (permisos?.create || permisos?.edit) && ( // 🛡️ 5. El modal se abre si se puede crear o editar
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase italic">Ficha Proveedor</h2>
              <button onClick={cerrarModal} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RNC / Cédula</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm" value={formData.rnc} onChange={e => setFormData({...formData, rnc: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Producto o Servicio que ofrece</label>
                <input 
                  placeholder="Ej: Materiales de Red, Consultoría, Limpieza..." 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm" 
                  value={formData.ofrece || ''} 
                  onChange={e => setFormData({...formData, ofrece: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección</label>
                <input 
                  placeholder="Ej: Av. Winston Churchill, Santo Domingo" 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm" 
                  value={formData.direccion || ''} 
                  onChange={e => setFormData({...formData, direccion: e.target.value})} 
                />
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-brand transition-all">
                {isEditing ? 'Actualizar Proveedor' : 'Registrar Proveedor'}
              </button> 
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedoresSection;