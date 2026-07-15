import React, { useEffect, useState } from 'react';
import { Layers3, Search, Calendar, AlertTriangle, Package, Warehouse, Info, Plus, Edit3, Trash2, X, Save, Ban } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';

const LotesSection = ({ mostrarToast, permisos }) => {
  // 🛡️ Extraemos los permisos específicos para esta sección
  const permisosLotes = permisos?.subModulos?.lotes ?? permisos;

  const { 
    lotes, cargarLotes, loading, productos, almacenesDetallados,
    agregarLote, actualizarLote, eliminarLote 
  } = useInventario();
  
  const [filtro, setFiltro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    productoId: '',
    numeroLote: '',
    cantidad: '',
    almacen: '',
    fechaVencimiento: ''
  });

  useEffect(() => {
  // 🛡️ Solo cargamos si el permiso no viene explícitamente en falso
  if (permisosLotes?.view !== false) {
    cargarLotes();
  }
}, [cargarLotes, permisosLotes?.view]);

  const lotesFiltrados = lotes.filter(l => 
    l.numeroLote?.toLowerCase().includes(filtro.toLowerCase()) ||
    l.producto?.nombre?.toLowerCase().includes(filtro.toLowerCase())
  );

  const getEstadoLote = (fechaVencimiento) => {
    if (!fechaVencimiento) return { label: 'Sin Vencimiento', color: 'bg-slate-100 text-slate-500' };
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: 'Vencido', color: 'bg-red-500 text-white' };
    if (diffDays <= 30) return { label: 'Próximo a Vencer', color: 'bg-amber-500 text-white' };
    return { label: 'Vigente', color: 'bg-emerald-500 text-white' };
  };

  const abrirModalCrear = () => {
    if (!permisosLotes?.create) return mostrarToast("No tienes permiso para crear lotes", "error");
    setIsEditing(false);
    setFormData({ productoId: '', numeroLote: '', cantidad: '', almacen: '', fechaVencimiento: '' });
    setShowModal(true);
  };

  const abrirModalEditar = (lote) => {
    if (!permisosLotes?.edit) return mostrarToast("No tienes permiso para editar lotes", "error");
    setIsEditing(true);
    setFormData({
      id: lote.id,
      productoId: lote.productoId,
      numeroLote: lote.numeroLote,
      cantidad: lote.cantidad,
      almacen: lote.almacen,
      fechaVencimiento: lote.fechaVencimiento ? new Date(lote.fechaVencimiento).toISOString().slice(0, 10) : ''
    });
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    
    // 🛡️ Verificación de permisos intacta
    if ((isEditing && !permisosLotes?.edit) || (!isEditing && !permisosLotes?.create)) {
      return mostrarToast("Acción no permitida", "error");
    }
    
    setIsSaving(true);
    
    try {
      // 🚀 CONSTRUCCIÓN EXPLÍCITA DEL PAYLOAD
      // Eliminamos el "...formData" para no enviar propiedades basura al backend
      const payload = {
        productoId: Number(formData.productoId),
        cantidad: Number(formData.cantidad),
        
        // 🌟 SOLUCIÓN: Mapeamos 'lote' o 'numeroLote' al nombre exacto de tu entidad NestJS
        numeroLote: (formData.numeroLote || formData.lote || '').trim(),
        
        // Enviamos el almacén (puedes adaptarlo si tu formulario maneja múltiples almacenes)
        almacen: formData.almacen || 'Principal',
        
        // Si maneja fecha de vencimiento la incluimos, si no, enviamos null limpiamente
        fechaVencimiento: formData.fechaVencimiento || null
      };

      // 🛑 Validación preventiva: Si el lote quedó vacío en el input, detenemos el proceso
      if (!payload.numeroLote) {
        setIsSaving(false);
        return mostrarToast("El número de lote es obligatorio", "warning");
      }

      // Ejecución de servicios original
      if (isEditing) {
        await actualizarLote(formData.id, payload);
        mostrarToast("Lote actualizado con éxito", "success");
      } else {
        await agregarLote(payload);
        mostrarToast("Lote creado con éxito", "success");
      }
      
      setShowModal(false);
    } catch (error) {
      mostrarToast(error.message || "Error al guardar el lote", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!permisosLotes?.delete) return mostrarToast("No tienes permiso para eliminar lotes", "error");
    if (window.confirm("¿Estás seguro de que deseas eliminar este lote?")) {
      try {
        await eliminarLote(id);
        mostrarToast("Lote eliminado con éxito", "success");
      } catch (error) {
        mostrarToast(error.message || "Error al eliminar el lote", "error");
      }
    }
  };

  if (permisosLotes && permisosLotes.view === false) {
    return (
      <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in duration-300">
        <Layers3 size={40} className="mx-auto mb-4 text-slate-300" />
        <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest italic">Acceso Restringido</h2>
        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">No tienes autorización para auditar los lotes de unidades</p>
      </div>
    );
  }

  // 💡 DESHABILITADO: Módulo de lotes desactivado temporalmente.
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center gap-4 bg-slate-50/50 p-10 rounded-2xl border-2 border-dashed border-slate-200 text-center">
        <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
          <Ban size={24} />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest italic">Módulo de Lotes Deshabilitado</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Esta funcionalidad no está activa en la versión actual del sistema.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Cabecera Técnica */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white rounded-lg">
            <Layers3 size={18} />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Trazabilidad por Lotes</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Control de caducidad y registros de producción</p>
          </div>
        </div>
        
        {permisosLotes?.create && (
          <button onClick={abrirModalCrear} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-brand transition-all active:scale-95">
            <Plus size={16} /> Nuevo Lote
          </button>
        )}

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Buscar por lote o producto..." 
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand text-[10px] font-bold uppercase"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Lotes */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-black tracking-widest italic">
            <tr>
              <th className="px-6 py-4">Producto / Info</th>
              <th className="px-6 py-4">No. Lote</th>
              <th className="px-6 py-4 text-center">Vencimiento</th>
              <th className="px-6 py-4 text-center">Existencia</th>
              <th className="px-6 py-4 text-right">Almacén</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {lotesFiltrados.length > 0 ? (
              lotesFiltrados.map(lote => {
                const estado = getEstadoLote(lote.fechaVencimiento);
                return (
                  <tr key={lote.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-brand">
                          <Package size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700 uppercase italic">{lote.producto?.nombre}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">SKU: {lote.producto?.codigo || '---'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-600 font-mono">
                        {lote.numeroLote}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-bold ${
                          estado.label === 'Vencido' ? 'text-red-500' : 
                          estado.label === 'Próximo a Vencer' ? 'text-amber-500' : 
                          'text-slate-600'
                        }`}>{lote.fechaVencimiento ? new Date(lote.fechaVencimiento).toLocaleDateString() : 'N/A'}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter ${estado.color}`}>
                          {estado.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-black text-slate-800">{lote.cantidad} <span className="text-[9px] text-slate-400 uppercase">uds</span></span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-[10px] text-slate-400 uppercase italic">
                      {lote.almacen || 'Principal'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {permisosLotes?.edit && (
                          <button onClick={() => abrirModalEditar(lote)} className="p-2 text-slate-400 hover:text-brand hover:bg-indigo-50 rounded-lg"><Edit3 size={14}/></button>
                        )}
                        {permisosLotes?.delete && (
                          <button onClick={() => handleEliminar(lote.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <Layers3 size={40} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No se encontraron lotes activos para este filtro</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear/Editar Lote */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">
                {isEditing ? 'Editar Lote' : 'Nuevo Lote'}
              </h2>
              <button onClick={() => setShowModal(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 shadow-sm transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleGuardar} className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Producto</label>
                <select required value={formData.productoId} onChange={e => setFormData({...formData, productoId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand font-bold text-sm">
                  <option value="">Seleccionar producto...</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Número de Lote</label>
                <input required value={formData.numeroLote} onChange={e => setFormData({...formData, numeroLote: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand font-bold text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cantidad</label>
                  <input type="number" required min="1" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand font-bold text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Almacén</label>
                  <select required value={formData.almacen} onChange={e => setFormData({...formData, almacen: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand font-bold text-sm">
                    <option value="">Seleccionar...</option>
                    {almacenesDetallados.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha de Vencimiento</label>
                <input type="date" value={formData.fechaVencimiento} onChange={e => setFormData({...formData, fechaVencimiento: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand font-bold text-sm" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-brand transition-all uppercase text-[10px] tracking-widest disabled:opacity-50">
                {isSaving ? 'Guardando...' : 'Guardar Lote'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotesSection;