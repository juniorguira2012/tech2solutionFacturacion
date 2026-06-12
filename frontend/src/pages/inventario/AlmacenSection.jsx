import React, { useState, useEffect } from 'react';
import { Warehouse, Plus, Boxes, MapPin, X, LayoutGrid, List, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';

import { useInventario } from '../../context/InventarioContext';

// Modal de Confirmación Estilizado para acciones críticas
const ConfirmModal = ({ isOpen, onConfirm, onCancel, titulo, descripcion, tipo = 'danger' }) => {
  if (!isOpen) return null;

  const esEliminar = tipo === 'danger';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Icono de advertencia */}
        <div className={`flex justify-center pt-8 pb-4`}>
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${esEliminar ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle size={32} className={esEliminar ? 'text-red-500' : 'text-amber-500'} />
          </div>
        </div>

        {/* Contenido de texto */}
        <div className="px-8 pb-6 text-center space-y-2">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">{titulo}</h3>
          <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{descripcion}</p>
        </div>

        {/* Botones de Acción */}
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

const AlmacenSection = ({ mostrarToast }) => {
  const [isAlmacenModalOpen, setIsAlmacenModalOpen] = useState(false);
  const [isUbicacionModalOpen, setIsUbicacionModalOpen] = useState(false);
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);
  
  const [vistaAlmacen, setVistaAlmacen] = useState(() => {
    return localStorage.getItem('posfactura_almacen_vista') || 'grid';
  });

  const [isEditingAlmacen, setIsEditingAlmacen] = useState(false);
  const [editandoAlmacenId, setEditandoAlmacenId] = useState(null);

  const [isEditingUbicacion, setIsEditingUbicacion] = useState(false);
  const [editandoUbicacionIdx, setEditandoUbicacionIdx] = useState(null);

  // Estado para controlar el modal de confirmación centralizado
  const [confirm, setConfirm] = useState({
    isOpen: false,
    titulo: '',
    descripcion: '',
    tipo: 'danger',
    onConfirm: null,
  });

  const mostrarConfirm = ({ titulo, descripcion, tipo = 'danger', onConfirm }) => {
    setConfirm({ isOpen: true, titulo, descripcion, tipo, onConfirm });
  };

  const cerrarConfirm = () => {
    setConfirm({ isOpen: false, titulo: '', descripcion: '', tipo: 'danger', onConfirm: null });
  };

  const { 
    almacenesDetallados: almacenes, 
    productos,
    agregarAlmacen, 
    actualizarAlmacen, 
    eliminarAlmacen 
  } = useInventario();
  const [almacenFormData, setAlmacenFormData] = useState({ nombre: '', descripcion: '' });
  const [ubicacionFormData, setUbicacionFormData] = useState({ nombre: '', codigo: '', tipo: 'Pasillo' });

  useEffect(() => {
    localStorage.setItem('posfactura_almacen_vista', vistaAlmacen);
  }, [vistaAlmacen]);

  const handleAbrirCrear = () => {
    setAlmacenFormData({ nombre: '', descripcion: '' });
    setEditandoAlmacenId(null);
    setIsEditingAlmacen(false);
    setIsAlmacenModalOpen(true);
  };

  const handleCerrarAlmacenModal = () => {
    setIsAlmacenModalOpen(false);
    setAlmacenFormData({ nombre: '', descripcion: '' });
    setIsEditingAlmacen(false);
    setEditandoAlmacenId(null);
  };

  const handleCerrarUbicacionModal = () => {
    setIsUbicacionModalOpen(false);
    setUbicacionFormData({ nombre: '', codigo: '', tipo: 'Pasillo' });
    setIsEditingUbicacion(false);
    setEditandoUbicacionIdx(null);
  };

  const handleAbrirEditar = (almacen) => {
    setAlmacenFormData({ nombre: almacen.nombre, descripcion: almacen.descripcion });
    setEditandoAlmacenId(almacen.id);
    setIsEditingAlmacen(true);
    setIsAlmacenModalOpen(true);
  };

  const handleEliminarAlmacen = (almacen) => {
    mostrarConfirm({
      titulo: '¿Eliminar Almacén?',
      descripcion: `¿Estás seguro de que deseas eliminar permanentemente el almacén "${almacen.nombre}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      onConfirm: async () => {
        try {
          await eliminarAlmacen(almacen.id);
          if (selectedAlmacen?.id === almacen.id) {
            setSelectedAlmacen(null);
            setIsUbicacionModalOpen(false);
          }
          mostrarToast("Almacén eliminado");
        } catch (error) {
          mostrarToast(error.message || "Error al eliminar", "error");
        } finally {
          cerrarConfirm();
        }
      }
    });
  };

  const handleGuardarAlmacen = async (e) => {
    e.preventDefault();
    try {
      if (isEditingAlmacen) {
        await actualizarAlmacen({ id: editandoAlmacenId, ...almacenFormData });
        mostrarToast("Almacén actualizado");
      } else {
        await agregarAlmacen(almacenFormData);
        mostrarToast("Almacén creado");
      }
      handleCerrarAlmacenModal();
    } catch (error) {
      mostrarToast("Error al conectar con el servidor", "error");
    }
  };

  const handleAbrirEditarUbicacion = (almacen, ubi, idx) => {
    setSelectedAlmacen(almacen);
    setUbicacionFormData(ubi);
    setEditandoUbicacionIdx(idx);
    setIsEditingUbicacion(true);
    setIsUbicacionModalOpen(true);
  };

  const handleEliminarUbicacion = (almacen, idx) => {
    const ubicacion = almacen.ubicaciones[idx];
    mostrarConfirm({
      titulo: '¿Eliminar Ubicación?',
      descripcion: `¿Seguro que deseas eliminar la ubicación "${ubicacion.nombre}"?`,
      tipo: 'danger',
      onConfirm: async () => {
        try {
          const nuevasUbicaciones = almacen.ubicaciones.filter((_, i) => i !== idx);
          await actualizarAlmacen({ id: almacen.id, ubicaciones: nuevasUbicaciones });
          mostrarToast("Ubicación eliminada");
        } catch (error) {
          mostrarToast("Error al eliminar ubicación", "error");
        } finally {
          cerrarConfirm();
        }
      }
    });
  };

  const handleGuardarUbicacion = async (e) => {
    e.preventDefault();
    try {
      let nuevasUbicaciones;
      if (isEditingUbicacion) {
        nuevasUbicaciones = selectedAlmacen.ubicaciones.map((u, i) => 
          i === editandoUbicacionIdx ? ubicacionFormData : u
        );
      } else {
        nuevasUbicaciones = [...(selectedAlmacen.ubicaciones || []), ubicacionFormData];
      }

      await actualizarAlmacen({ id: selectedAlmacen.id, ubicaciones: nuevasUbicaciones });
      
      handleCerrarUbicacionModal();
      mostrarToast(isEditingUbicacion ? "Ubicación actualizada" : "Ubicación añadida");
    } catch (error) {
      mostrarToast("Error al guardar ubicación", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Modal de confirmación centralizado */}
      <ConfirmModal
        isOpen={confirm.isOpen}
        titulo={confirm.titulo}
        descripcion={confirm.descripcion}
        tipo={confirm.tipo}
        onConfirm={confirm.onConfirm}
        onCancel={cerrarConfirm}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
            <Warehouse size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">Almacén y Ubicaciones</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gestión de espacios físicos</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button
              type="button"
              onClick={() => setVistaAlmacen('grid')}
              className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${vistaAlmacen === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              title="Ver como tarjetas"
              aria-label="Ver almacenes como tarjetas"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setVistaAlmacen('list')}
              className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${vistaAlmacen === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              title="Ver como lista"
              aria-label="Ver almacenes como lista"
            >
              <List size={16} />
            </button>
          </div>
          <button 
            onClick={handleAbrirCrear}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-indigo-600 transition-all active:scale-95"
          >
            <Plus size={16} /> Crear almacén
          </button>
        </div>
      </div>

      <div className={vistaAlmacen === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
        {almacenes.map(almacen => (
          <div key={almacen.id} className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group ${vistaAlmacen === 'list' ? 'lg:flex lg:items-stretch' : ''}`}>
            <div className={`p-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start gap-4 ${vistaAlmacen === 'list' ? 'lg:w-80 lg:border-b-0 lg:border-r' : ''}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 border border-slate-100 shadow-sm">
                  <Boxes size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-800 uppercase italic truncate">{almacen.nombre}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{almacen.descripcion || 'Sin descripción'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    setSelectedAlmacen(almacen);
                    setIsUbicacionModalOpen(true);
                  }}
                  className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  title="Agregar ubicación"
                  aria-label={`Agregar ubicación a ${almacen.nombre}`}
                >
                  <MapPin size={16} />
                </button>
                <button
                  onClick={() => handleAbrirEditar(almacen)}
                  className="p-2 text-slate-500 bg-white border border-slate-100 rounded-lg hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100 transition-all shadow-sm"
                  title="Editar almacén"
                  aria-label={`Editar almacén ${almacen.nombre}`}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleEliminarAlmacen(almacen)}
                  className="p-2 text-slate-400 bg-white border border-slate-100 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                  title="Eliminar almacén"
                  aria-label={`Eliminar almacén ${almacen.nombre}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-5 flex-1 space-y-6">
              <div className="space-y-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Ubicaciones Registradas ({almacen.ubicaciones?.length || 0})</p>
                {almacen.ubicaciones?.length > 0 ? (
                  <div className={vistaAlmacen === 'grid' ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2'}>
                    {almacen.ubicaciones?.map((ubi, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded-lg group/ubi relative">
                        <p className="text-[9px] font-black text-slate-700 uppercase truncate">{ubi.nombre}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-tighter bg-white px-1.5 py-0.5 rounded border border-indigo-50">{ubi.codigo}</span>
                          <span className="text-[7px] font-black text-slate-400 uppercase italic">{ubi.tipo}</span>
                        </div>
                        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover/ubi:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleAbrirEditarUbicacion(almacen, ubi, idx)}
                            className="p-1 bg-white border border-slate-100 rounded text-slate-400 hover:text-amber-500 shadow-sm transition-colors"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button 
                            onClick={() => handleEliminarUbicacion(almacen, idx)}
                            className="p-1 bg-white border border-slate-100 rounded text-slate-400 hover:text-rose-500 shadow-sm transition-colors"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Sin ubicaciones</p>
                  </div>
                )}
              </div>

              {/* Nueva Sección: Productos Asignados */}
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">
                  Productos en Stock ({productos.filter(p => (p.almacen || 'Principal') === almacen.nombre).length})
                </p>
                {productos.filter(p => (p.almacen || 'Principal') === almacen.nombre).length > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5">
                    {productos
                      .filter(p => (p.almacen || 'Principal') === almacen.nombre)
                      .slice(0, 5) // Mostramos solo los primeros 5 para no saturar la tarjeta
                      .map((prod) => (
                        <div key={prod.id} className="flex items-center justify-between p-2 bg-indigo-50/30 rounded-lg border border-indigo-50/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <Package size={12} className="text-indigo-400 shrink-0" />
                            <span className="text-[9px] font-bold text-slate-700 uppercase truncate">{prod.nombre}</span>
                          </div>
                          <span className="text-[9px] font-black text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-50 shrink-0">
                            {prod.stock} {prod.unidadMedida}
                          </span>
                        </div>
                      ))}
                    {productos.filter(p => (p.almacen || 'Principal') === almacen.nombre).length > 5 && (
                      <p className="text-[8px] text-center text-slate-400 font-bold uppercase py-1 italic tracking-widest">
                        + {productos.filter(p => (p.almacen || 'Principal') === almacen.nombre).length - 5} productos adicionales
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Sin mercancía asignada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Almacén */}
      {isAlmacenModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">
                {isEditingAlmacen ? 'Editar Almacén' : 'Crear Almacén'}
              </h2>
              <button onClick={handleCerrarAlmacenModal} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 shadow-sm transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleGuardarAlmacen} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del Almacén</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-sm text-slate-700 transition-all focus:bg-white" 
                  value={almacenFormData.nombre} onChange={e => setAlmacenFormData({...almacenFormData, nombre: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Descripción (Opcional)</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-sm text-slate-700 transition-all focus:bg-white" 
                  value={almacenFormData.descripcion} onChange={e => setAlmacenFormData({...almacenFormData, descripcion: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-600 transition-all uppercase text-[10px] tracking-[0.2em]">
                {isEditingAlmacen ? 'Actualizar Almacén' : 'Guardar Almacén'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Ubicación */}
      {isUbicacionModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">{isEditingUbicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}</h2>
                <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{selectedAlmacen?.nombre}</p>
              </div>
              <button onClick={handleCerrarUbicacionModal} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 shadow-sm transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleGuardarUbicacion} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre / Etiqueta</label>
                <input required placeholder="Ej: Pasillo A" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-sm text-slate-700 transition-all focus:bg-white" 
                  value={ubicacionFormData.nombre} onChange={e => setUbicacionFormData({...ubicacionFormData, nombre: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Código de Ubicación</label>
                <input required placeholder="Ej: P-A-01" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-sm text-slate-700 transition-all focus:bg-white" 
                  value={ubicacionFormData.codigo} onChange={e => setUbicacionFormData({...ubicacionFormData, codigo: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo de Ubicación</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-black text-[10px] uppercase text-slate-600 bg-white shadow-sm cursor-pointer"
                  value={ubicacionFormData.tipo} onChange={e => setUbicacionFormData({...ubicacionFormData, tipo: e.target.value})}
                >
                  <option value="Pasillo">Pasillo</option>
                  <option value="Estante">Estante</option>
                  <option value="Fila">Fila</option>
                  <option value="Nivel">Nivel</option>
                  <option value="Bin">Bin / Cajón</option>
                  <option value="Zona">Zona de Despacho</option>
                </select>
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-600 transition-all uppercase text-[10px] tracking-[0.2em]">
                {isEditingUbicacion ? 'Actualizar Ubicación' : 'Registrar Ubicación'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlmacenSection;
