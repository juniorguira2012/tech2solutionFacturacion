import React, { useState, useMemo } from 'react';
import {
  X, Image, Settings, Plus, MinusCircle, Edit3, Trash2
} from 'lucide-react';

const ProductoModal = ({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  isSaving,
  formData,
  setFormData,
  categorias,
  proveedores,
  unidadesMedida,
  almacenesDetallados,
  handleUpdateSerial,
  mostrarToast,
  handleDeleteSerial, // <-- 1. Recibimos la nueva función para eliminar
}) => {
  if (!isOpen) return null;

  // Lógica que antes estaba en ProductosSection pero pertenece al modal
  const [showNuevoCampo, setShowNuevoCampo] = useState(false);
  const [nuevoCampo, setNuevoCampo] = useState({ nombre: '', valor: '' });

  const camposConfigGlobal = useMemo(() => {
    try {
      const saved = localStorage.getItem('posfactura_campos_personalizados');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }, []);

  const ubicacionesDisponibles = useMemo(() => {
    const almacenEncontrado = almacenesDetallados.find(a => a.nombre === formData.almacen);
    return almacenEncontrado ? almacenEncontrado.ubicaciones : [];
  }, [formData.almacen, almacenesDetallados]);

  const handleImagenUpload = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onload = () => setFormData(prev => ({ ...prev, imagen: reader.result || '' }));
    reader.readAsDataURL(archivo);
  };

  const handleInternalUpdateSerial = async (serialId, nuevoNumero) => {
    try {
      // Llama a la función del padre, que a su vez llama al contexto
      const serialActualizado = await handleUpdateSerial(serialId, nuevoNumero);
      if (serialActualizado) {
        // Actualizamos el estado local del formulario para reflejar el cambio
        setFormData(prev => ({
          ...prev,
          serialesExistentes: prev.serialesExistentes.map(s => 
            s.id === serialId ? serialActualizado : s
          )
        }));
        mostrarToast('Serial actualizado con éxito', 'success');
      }
    } catch (error) {
      mostrarToast(error.message || 'No se pudo actualizar el serial', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800 uppercase italic">
            {isEditing ? 'Actualizar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white shadow-sm"><X size={20}/></button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre *</label>
              <input required className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Código / SKU</label>
              <input className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm" value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Modelo</label>
              <input className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm" value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Serie / Serial</label>
              <input className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm" value={formData.serie} onChange={(e) => setFormData({...formData, serie: e.target.value})}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Categoría</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm bg-white" 
                value={formData.categoria} 
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              >
                {categorias.map(cat => <option key={cat.nombre} value={cat.nombre}>{cat.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Proveedor Autorizado</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm bg-white"
                value={formData.proveedorId || ''} 
                onChange={(e) => setFormData({...formData, proveedorId: e.target.value})}
              >
                <option value="">Ninguno / Sin Proveedor</option>
                {proveedores && proveedores.map(prov => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre} {prov.rnc ? `(RNC: ${prov.rnc})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Imagen (URL o Archivo)</label>
              <div className="flex gap-3 items-center">
                <div className="h-16 w-16 rounded-xl border bg-slate-50 flex items-center justify-center overflow-hidden">
                  {formData.imagen ? <img src={formData.imagen} alt="preview" className="h-full w-full object-cover"/> : <Image size={20} className="text-slate-300"/>}
                </div>
                <input className="flex-1 px-5 py-3 rounded-2xl border outline-none text-sm font-bold" placeholder="URL de imagen" value={formData.imagen} onChange={(e) => setFormData({...formData, imagen: e.target.value})}/>
                <input type="file" accept="image/*" onChange={handleImagenUpload} className="hidden" id="file-upload"/>
                <label htmlFor="file-upload" className="px-4 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase cursor-pointer hover:bg-slate-700 transition-colors">Subir</label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="text-[10px] font-black text-indigo-400 uppercase ml-1">Precio *</label>
              <input type="number" step="0.01" required className="w-full px-5 py-3 rounded-2xl border-indigo-100 border outline-none font-black text-sm" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-indigo-400 uppercase ml-1">
                {formData.isSerialized ? 'Cantidad de Seriales' : 'Stock Inicial *'}
              </label>
              <input 
                type="number" 
                required 
                className="w-full px-5 py-3 rounded-2xl border-indigo-100 border outline-none font-black text-sm disabled:bg-slate-100" 
                value={formData.isSerialized ? formData.serialsInput.split(/[\n,]+/).filter(Boolean).length : formData.stock} 
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                disabled={formData.isSerialized}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Unidad</label>
              <select className="w-full px-5 py-3 rounded-2xl border outline-none font-bold text-sm" value={formData.unidadMedida} onChange={(e) => setFormData({...formData, unidadMedida: e.target.value})}>
                {unidadesMedida.filter(u => u.activo).map(u => <option key={u.id} value={u.nombre}>{u.nombre}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl">
               <label className="flex items-center gap-3 cursor-pointer p-3">
                <input 
                  type="checkbox" 
                  className="h-5 w-5 rounded text-brand focus:ring-brand"
                  checked={formData.isSerialized}
                  onChange={(e) => setFormData({...formData, isSerialized: e.target.checked})}
                />
                <span className="text-[10px] font-black text-slate-600 uppercase">
                  Producto Serializado
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Almacén de Depósito</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm bg-white"
                value={formData.almacen}
                onChange={(e) => setFormData({...formData, almacen: e.target.value, pasillo: ''})}
              >
                <option value="">Seleccionar Almacén</option>
                {almacenesDetallados.map(al => (
                  <option key={al.id} value={al.nombre}>{al.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ubicación / Pasillo</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm bg-white"
                value={formData.pasillo}
                onChange={(e) => setFormData({...formData, pasillo: e.target.value})}
                disabled={!ubicacionesDisponibles.length}
              >
                <option value="">
                  {ubicacionesDisponibles.length > 0 ? 'Seleccionar Ubicación' : 'Sin ubicaciones creadas'}
                </option>
                {ubicacionesDisponibles.map((ubi, idx) => (
                  <option key={idx} value={ubi.nombre}>
                    {ubi.nombre} ({ubi.codigo})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fila / Nivel</label>
              <input 
                placeholder="Ej: Nivel 2"
                className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm" 
                value={formData.fila} 
                onChange={(e) => setFormData({...formData, fila: e.target.value})}
              />
            </div>
          </div>

          {formData.isSerialized && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Ingresar Seriales (uno por línea o separados por coma)
                </label>
                <textarea
                  placeholder="SN-001&#10;SN-002,SN-003"
                  className="w-full p-4 rounded-2xl border font-mono text-xs h-48 resize-y"
                  value={formData.serialsInput}
                  onChange={(e) => setFormData({...formData, serialsInput: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    {isEditing ? 'Seriales Disponibles' : 'Seriales a Registrar'} ({isEditing ? formData.serialesExistentes.filter(s => s.status === 'disponible').length : formData.serialsInput.split(/[\n,]+/).filter(Boolean).length})
                  </label>
                  {isEditing && <span className="text-[9px] font-bold text-slate-400">Añade nuevos en el campo de la izquierda</span>}
                </div>
                <div className="h-48 overflow-y-auto border rounded-2xl bg-slate-50/50">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-[9px] font-black uppercase text-slate-500">#</th>
                        <th className="px-4 py-2 text-[9px] font-black uppercase text-slate-500">Número de Serie</th>
                        {isEditing && (
                          <React.Fragment>
                            <th className="px-4 py-2 text-[9px] font-black uppercase text-slate-500">Estado</th>
                            <th className="px-4 py-2 text-[9px] font-black uppercase text-slate-500">Almacén</th>
                            <th className="px-4 py-2 text-[9px] font-black uppercase text-slate-500 text-right">Acción</th>
                          </React.Fragment>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isEditing ? (
                        formData.serialesExistentes.filter(serial => serial.status === 'disponible').map((serial, index) => (
                          <tr key={serial.id} className="text-xs">
                            <td className="px-4 py-2 text-slate-400 font-sans font-bold">{index + 1}</td>
                            <td className="px-4 py-2 font-bold text-slate-700 font-mono">{serial.serialNumber}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                serial.status === 'disponible' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {serial.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-bold text-slate-500 uppercase text-[9px]">{serial.almacen}</td>
                            <td className="px-4 py-2 text-right">
                              {serial.status === 'disponible' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nuevo = window.prompt('Introduce el nuevo número de serie:', serial.serialNumber);
                                    if (nuevo && nuevo.trim() !== serial.serialNumber) {
                                      handleInternalUpdateSerial(serial.id, nuevo.trim());
                                    }
                                  }}
                                  className="p-1.5 text-brand hover:bg-indigo-50 rounded-lg transition-colors">
                                  <Edit3 size={14}/>
                                </button>
                              )}
                              {/* -- 2. Botón de Eliminar -- */}
                              {serial.status === 'disponible' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSerial(serial.id)}
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar este serial del producto">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        formData.serialsInput.split(/[\n,]+/).filter(Boolean).map((serial, index) => (
                          <tr key={index} className="text-xs font-mono">
                            <td className="px-4 py-1.5 text-slate-400 font-sans font-bold">{index + 1}</td>
                            <td className="px-4 py-1.5 font-bold text-slate-700">{serial.trim().toUpperCase()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-black text-slate-600 uppercase flex items-center gap-2">
              <Settings size={16}/> Atributos Adicionales
            </h3>
            
            {camposConfigGlobal.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {camposConfigGlobal.map(campo => (
                  <div key={campo.id}>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      {campo.etiqueta} {campo.obligatorio && '*'}
                    </label>
                    <input 
                      type={campo.tipo === 'numero' ? 'number' : 'text'}
                      required={campo.obligatorio}
                      className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm"
                      value={formData.camposPersonalizados?.find(c => c.nombre === campo.clave)?.valor || ''}
                      onChange={(e) => {
                        const otros = formData.camposPersonalizados.filter(c => c.nombre !== campo.clave);
                        setFormData({
                          ...formData,
                          camposPersonalizados: [...otros, { nombre: campo.clave, valor: e.target.value }]
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 italic">No hay atributos adicionales configurados.</p>
            )}

            <div className="mt-6 pt-4 border-t border-dashed border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Otros Detalles Específicos</h4>
                <button 
                  type="button" 
                  onClick={() => setShowNuevoCampo(!showNuevoCampo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase hover:bg-brand hover:text-white transition-all"
                >
                  {showNuevoCampo ? <X size={12}/> : <Plus size={12}/>}
                  {showNuevoCampo ? 'Cancelar' : 'Nuevo Campo'}
                </button>
              </div>

              {showNuevoCampo && (
                <div className="flex gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 animate-in slide-in-from-top-2">
                  <div className="flex-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Nombre del campo</label>
                    <input className="w-full px-4 py-2 rounded-xl border text-xs font-bold" placeholder="Ej: Color" value={nuevoCampo.nombre} onChange={(e) => setNuevoCampo({...nuevoCampo, nombre: e.target.value})}/>
                  </div>
                  <div className="flex-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Valor</label>
                    <input className="w-full px-4 py-2 rounded-xl border text-xs font-bold" placeholder="Ej: Azul" value={nuevoCampo.valor} onChange={(e) => setNuevoCampo({...nuevoCampo, valor: e.target.value})}/>
                  </div>
                  <button type="button" onClick={() => {
                    if (nuevoCampo.nombre && nuevoCampo.valor) {
                      setFormData({
                        ...formData,
                        camposPersonalizados: [...formData.camposPersonalizados, { ...nuevoCampo, id: Date.now() }]
                      });
                      setNuevoCampo({ nombre: '', valor: '' });
                      setShowNuevoCampo(false);
                    }
                  }} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase h-[38px]">Añadir</button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formData.camposPersonalizados
                  .filter(cp => !camposConfigGlobal.some(cg => cg.clave === cp.nombre))
                  .map((c, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm group">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{c.nombre}</span>
                        <span className="text-xs font-bold text-slate-700">{c.valor}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          const filtrados = formData.camposPersonalizados.filter((_, i) => formData.camposPersonalizados.indexOf(c) !== i);
                          setFormData({ ...formData, camposPersonalizados: filtrados });
                        }} 
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <MinusCircle size={14}/>
                      </button>
                    </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-brand transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              isEditing ? 'Confirmar Cambios' : 'Registrar en Inventario'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductoModal;