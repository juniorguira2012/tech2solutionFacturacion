import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Braces, CheckCircle, X } from 'lucide-react';

const CamposPersonalizadosSection = ({ mostrarToast, permisos }) => {
  // 🛡️ Extraemos los permisos específicos para esta sección
  const permisosCampos = permisos?.subModulos?.campos ?? permisos;

  const [camposPersonalizadosGlobales, setCamposPersonalizadosGlobales] = useState(() => {
    try {
      const saved = localStorage.getItem('posfactura_campos_personalizados');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [showFormularioCampo, setShowFormularioCampo] = useState(false);
  const [formularioCampo, setFormularioCampo] = useState({
    etiqueta: '',
    clave: '',
    tipo: 'texto',
    aplicaA: 'ambos',
    obligatorio: false,
    apareceEnBusqueda: false,
    orden: camposPersonalizadosGlobales.length + 1
  });
  const [editingCampoId, setEditingCampoId] = useState(null);

  useEffect(() => {
    try { localStorage.setItem('posfactura_campos_personalizados', JSON.stringify(camposPersonalizadosGlobales)); } catch (e) {}
  }, [camposPersonalizadosGlobales]);

  const guardarCampo = () => {
    if ((editingCampoId && !permisosCampos?.edit) || (!editingCampoId && !permisosCampos?.create)) {
      mostrarToast?.("No tienes permiso para realizar esta acción", "error");
      return;
    }
    if (!formularioCampo.etiqueta.trim() || !formularioCampo.clave.trim()) {
      mostrarToast?.('Etiqueta y Clave son obligatorios', 'warning');
      return;
    }
    if (editingCampoId) {
      setCamposPersonalizadosGlobales(prev => prev.map(c => c.id === editingCampoId ? { ...formularioCampo, id: editingCampoId } : c));
      setEditingCampoId(null);
    } else {
      setCamposPersonalizadosGlobales(prev => [...prev, { ...formularioCampo, id: Date.now() }]);
    }
    setFormularioCampo({
      etiqueta: '',
      clave: '',
      tipo: 'texto',
      aplicaA: 'ambos',
      obligatorio: false,
      apareceEnBusqueda: false,
      orden: camposPersonalizadosGlobales.length + 1
    });
    setShowFormularioCampo(false);
  };

  const cancelarFormularioCampo = () => {
    setShowFormularioCampo(false);
    setEditingCampoId(null);
    setFormularioCampo({
      etiqueta: '',
      clave: '',
      tipo: 'texto',
      aplicaA: 'ambos',
      obligatorio: false,
      apareceEnBusqueda: false,
      orden: camposPersonalizadosGlobales.length + 1
    });
  };

  const eliminarCampo = (id) => {
    if (!permisosCampos?.delete) {
      mostrarToast?.("No tienes permiso para eliminar campos", "error");
      return;
    }
    setCamposPersonalizadosGlobales(prev => prev.filter(c => c.id !== id));
  };

  const comenzarEditarCampo = (campo) => {
    if (!permisosCampos?.edit) {
      mostrarToast?.("No tienes permiso para editar campos", "error");
      return;
    }
    setFormularioCampo(campo);
    setEditingCampoId(campo.id);
    setShowFormularioCampo(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
      <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-4">
        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
          <Braces size={18} />
        </div>
        <div className="flex-1">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Campos Personalizados</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Define los atributos que tus productos y servicios necesitan: VIN, año modelo, talla, principio activo, lo que sea relevante para los negocios.</p>
        </div>
        <div className="ml-auto">
          {permisosCampos?.create && (
            <button type="button" onClick={() => setShowFormularioCampo(true)} className="h-9 px-3 rounded-lg bg-emerald-500 text-white font-black flex items-center gap-2">
              <Plus size={14}/> Nuevo Campo
            </button>
          )}
        </div>
      </div>

      {showFormularioCampo && (permisosCampos?.create || permisosCampos?.edit) && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Etiqueta *</label>
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: VIN, Año Modelo" value={formularioCampo.etiqueta} onChange={(e)=>setFormularioCampo({...formularioCampo, etiqueta:e.target.value})}/>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Clave *</label>
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: vin, anno_modelo" value={formularioCampo.clave} onChange={(e)=>setFormularioCampo({...formularioCampo, clave:e.target.value})}/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Tipo</label>
              <select className="w-full px-3 py-2 border rounded-lg" value={formularioCampo.tipo} onChange={(e)=>setFormularioCampo({...formularioCampo, tipo:e.target.value})}>
                <option value="texto">Texto</option>
                <option value="numero">Número</option>
                <option value="fecha">Fecha</option>
                <option value="select">Selección</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Aplica A</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="aplicaA" value="ambos" checked={formularioCampo.aplicaA === 'ambos'} onChange={(e)=>setFormularioCampo({...formularioCampo, aplicaA:e.target.value})} className="cursor-pointer"/>
                <span className="text-sm">Productos y Servicios</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="aplicaA" value="producto" checked={formularioCampo.aplicaA === 'producto'} onChange={(e)=>setFormularioCampo({...formularioCampo, aplicaA:e.target.value})} className="cursor-pointer"/>
                <span className="text-sm">Solo Productos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="aplicaA" value="servicio" checked={formularioCampo.aplicaA === 'servicio'} onChange={(e)=>setFormularioCampo({...formularioCampo, aplicaA:e.target.value})} className="cursor-pointer"/>
                <span className="text-sm">Solo Servicios</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formularioCampo.obligatorio} onChange={(e)=>setFormularioCampo({...formularioCampo, obligatorio:e.target.checked})} className="cursor-pointer"/>
              <span className="text-sm font-black uppercase text-slate-700">Obligatorio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formularioCampo.apareceEnBusqueda} onChange={(e)=>setFormularioCampo({...formularioCampo, apareceEnBusqueda:e.target.checked})} className="cursor-pointer"/>
              <span className="text-sm font-black uppercase text-slate-700">Aparece en la búsqueda</span>
            </label>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Orden de Presentación</label>
            <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formularioCampo.orden} onChange={(e)=>setFormularioCampo({...formularioCampo, orden:parseInt(e.target.value) || 1})}/>
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={cancelarFormularioCampo} className="px-4 py-2 bg-red-50 text-red-500 rounded-lg font-bold">Cancelar</button>
            <button type="button" onClick={guardarCampo} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold">Guardar Campo</button>
          </div>
        </div>
      )}

      <div className="space-y-2 mt-4">
        {camposPersonalizadosGlobales.sort((a, b) => a.orden - b.orden).map(campo => (
          <div key={campo.id} className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
            <div className="flex-1">
              <h4 className="text-xs font-black text-slate-800">{campo.etiqueta}</h4>
              <div className="text-[9px] text-slate-500 space-x-2 mt-1">
                <span className="bg-slate-200 px-2 py-1 rounded">Clave: {campo.clave}</span>
                <span className="bg-slate-200 px-2 py-1 rounded">Tipo: {campo.tipo}</span>
                <span className="bg-slate-200 px-2 py-1 rounded">Aplica: {campo.aplicaA === 'ambos' ? 'Ambos' : campo.aplicaA === 'producto' ? 'Producto' : 'Servicio'}</span>
                {campo.obligatorio && <span className="bg-red-200 px-2 py-1 rounded text-red-700">Obligatorio</span>}
                {campo.apareceEnBusqueda && <span className="bg-blue-200 px-2 py-1 rounded text-blue-700">En búsqueda</span>}
                <span className="bg-slate-200 px-2 py-1 rounded">Orden: {campo.orden}</span>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              {permisosCampos?.edit && (
                <button onClick={() => comenzarEditarCampo(campo)} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg"><Edit3 size={14}/></button>
              )}
              {permisosCampos?.delete && (
                <button onClick={() => eliminarCampo(campo.id)} className="px-3 py-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
              )}
            </div>
          </div>
        ))}
        {camposPersonalizadosGlobales.length === 0 && !showFormularioCampo && (
          <div className="py-8 text-center text-slate-400">
            <p className="text-xs font-black uppercase">No hay campos personalizados creados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CamposPersonalizadosSection;
