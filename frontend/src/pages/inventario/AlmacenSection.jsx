import React, { useState, useEffect } from 'react';
import { Warehouse, Plus, Boxes, MapPin, X, LayoutGrid, List, Edit2, Trash2 } from 'lucide-react';

import { useInventario } from '../../context/InventarioContext';

const AlmacenSection = ({ mostrarToast }) => {
  const [isAlmacenModalOpen, setIsAlmacenModalOpen] = useState(false);
  const [isUbicacionModalOpen, setIsUbicacionModalOpen] = useState(false);
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);
  
  const [vistaAlmacen, setVistaAlmacen] = useState(() => {
    return localStorage.getItem('posfactura_almacen_vista') || 'grid';
  });

  const [isEditingAlmacen, setIsEditingAlmacen] = useState(false);
  const [editandoAlmacenId, setEditandoAlmacenId] = useState(null);

  const { almacenesDetallados: almacenes, setAlmacenesDetallados: setAlmacenes } = useInventario();
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

  const handleAbrirEditar = (almacen) => {
    setAlmacenFormData({ nombre: almacen.nombre, descripcion: almacen.descripcion });
    setEditandoAlmacenId(almacen.id);
    setIsEditingAlmacen(true);
    setIsAlmacenModalOpen(true);
  };

  const handleEliminarAlmacen = (almacen) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el almacén "${almacen.nombre}"?`)) return;

    setAlmacenes(prev => prev.filter(al => al.id !== almacen.id));
    if (selectedAlmacen?.id === almacen.id) {
      setSelectedAlmacen(null);
      setIsUbicacionModalOpen(false);
    }
    mostrarToast("Almacén eliminado");
  };

  const handleGuardarAlmacen = (e) => {
    e.preventDefault();
    if (isEditingAlmacen) {
      setAlmacenes(prev => prev.map(al => 
        al.id === editandoAlmacenId ? { ...al, ...almacenFormData } : al
      ));
      mostrarToast("Almacén actualizado");
    } else {
      setAlmacenes([...almacenes, { ...almacenFormData, id: Date.now(), ubicaciones: [] }]);
      mostrarToast("Almacén creado");
    }
    handleCerrarAlmacenModal();
  };

  const handleGuardarUbicacion = (e) => {
    e.preventDefault();
    setAlmacenes(prev => prev.map(al => 
      al.id === selectedAlmacen.id 
      ? { ...al, ubicaciones: [...al.ubicaciones, ubicacionFormData] }
      : al
    ));
    setIsUbicacionModalOpen(false);
    setUbicacionFormData({ nombre: '', codigo: '', tipo: 'Pasillo' });
    mostrarToast("Ubicación añadida");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
            
            <div className="p-5 flex-1">
              <div className="space-y-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Ubicaciones Registradas ({almacen.ubicaciones.length})</p>
                {almacen.ubicaciones.length > 0 ? (
                  <div className={vistaAlmacen === 'grid' ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2'}>
                    {almacen.ubicaciones.map((ubi, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <p className="text-[9px] font-black text-slate-700 uppercase truncate">{ubi.nombre}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-tighter bg-white px-1.5 py-0.5 rounded border border-indigo-50">{ubi.codigo}</span>
                          <span className="text-[7px] font-black text-slate-400 uppercase italic">{ubi.tipo}</span>
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
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Nueva Ubicación</h2>
                <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{selectedAlmacen?.nombre}</p>
              </div>
              <button onClick={() => setIsUbicacionModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 shadow-sm transition-all"><X size={20} /></button>
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
                Registrar Ubicación
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlmacenSection;
