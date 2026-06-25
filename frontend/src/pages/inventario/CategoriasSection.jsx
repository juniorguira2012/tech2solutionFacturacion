import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';

// Modal de Confirmación (reutilizado de otros componentes)
const ConfirmModal = ({ isOpen, onConfirm, onCancel, titulo, descripcion }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-center pt-8 pb-4">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-red-50">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
        </div>
        <div className="px-8 pb-6 text-center space-y-2">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">{titulo}</h3>
          <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{descripcion}</p>
        </div>
        <div className="flex border-t border-slate-100">
          <button onClick={onCancel} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors border-r border-slate-100">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 transition-colors">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoriasSection = ({ mostrarToast }) => {
  const { categorias, agregarCategoria, actualizarCategoria, eliminarCategoria } = useInventario();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '' });
  const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null });

  const abrirModalParaCrear = () => {
    setIsEditing(false);
    setFormData({ id: null, nombre: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const abrirModalParaEditar = (categoria) => {
    setIsEditing(true);
    setFormData(categoria);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing) {
        await actualizarCategoria(formData.id, { nombre: formData.nombre, descripcion: formData.descripcion });
        mostrarToast('Categoría actualizada con éxito', 'success');
      } else {
        await agregarCategoria({ nombre: formData.nombre, descripcion: formData.descripcion });
        mostrarToast('Categoría creada con éxito', 'success');
      }
      cerrarModal();
    } catch (error) {
      mostrarToast(error.message || 'Error al guardar', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (categoria) => {
    setConfirm({
      isOpen: true,
      onConfirm: async () => {
        try {
          await eliminarCategoria(categoria.id);
          mostrarToast(`Categoría "${categoria.nombre}" eliminada`, 'success');
        } catch (error) {
          mostrarToast(error.message || 'No se pudo eliminar', 'error');
        } finally {
          setConfirm({ isOpen: false, onConfirm: null });
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ConfirmModal
        isOpen={confirm.isOpen}
        titulo="¿Eliminar Categoría?"
        descripcion="Esta acción es irreversible y podría afectar a productos existentes."
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ isOpen: false, onConfirm: null })}
      />

      {/* Header y botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-100">
            <Tag size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">Categorías de Productos</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Organiza tu inventario</p>
          </div>
        </div>
        <button onClick={abrirModalParaCrear} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-sky-600 transition-all active:scale-95">
          <Plus size={16} /> Crear Categoría
        </button>
      </div>

      {/* Lista de Categorías */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
          {categorias.length > 0 ? (
            categorias.map(cat => (
              <div key={cat.id} className="group bg-white border border-slate-100 rounded-xl p-4 hover:shadow-lg hover:border-sky-200 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-xs">{cat.nombre}</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 line-clamp-2">{cat.descripcion || 'Sin descripción'}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => abrirModalParaEditar(cat)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(cat)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No hay categorías registradas</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear/Editar Categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">
                {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button onClick={cerrarModal} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 shadow-sm transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre</label>
                <input
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-600 font-bold text-sm text-slate-700 transition-all focus:bg-white"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Descripción (Opcional)</label>
                <textarea
                  rows="3"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-600 font-bold text-sm text-slate-700 transition-all focus:bg-white resize-none"
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-sky-600 transition-all uppercase text-[10px] tracking-[0.2em] disabled:bg-slate-300"
              >
                {isSaving ? 'Guardando...' : (isEditing ? 'Actualizar Categoría' : 'Guardar Categoría')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasSection;