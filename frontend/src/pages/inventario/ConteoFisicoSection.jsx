import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ClipboardList, Plus, LayoutGrid, List, 
  History, CheckCircle, XCircle, Clock, RefreshCw,
  ArrowRight, Warehouse, BarChart3, Edit3, Trash2, X, Search, Save, AlertTriangle, ChevronLeft, ScanLine
} from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';
import { useAuth } from '../../context/AuthContext';
import { useScanner } from '../../hooks/useScanner'; // 🛡️ 1. Recibimos los permisos

const ConteoFisicoSection = ({ mostrarToast, permisos }) => {
  const { 
    productos,
    conteos, 
    cargarConteos, 
    crearConteo, 
    eliminarConteo,
    almacenesDetallados 
  } = useInventario();
  const { usuario } = useAuth();

  const [vista, setVista] = useState(() => {
    return localStorage.getItem('posfactura_conteo_vista') || 'grid';
  });
  
  // Estados de navegación interna
  const [viewMode, setViewMode] = useState('main'); // 'main', 'counting', 'review'
  const [conteoActivo, setConteoActivo] = useState(null);

  // Estados para el modal de creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nuevoConteoData, setNuevoConteoData] = useState({
    almacen: '',
    descripcion: ''
  });

  useEffect(() => {
    localStorage.setItem('posfactura_conteo_vista', vista);
  }, [vista]);

  // Debug de datos recibidos del contexto
  useEffect(() => {
    console.log("ConteoFisicoSection: Datos de conteos en el componente:", conteos);
  }, [conteos]);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarConteos();
  }, [cargarConteos]);

  const handleCrearConteo = async (e) => {
    e.preventDefault();
    // 🛡️ 2. Verificación de permiso de creación
    if (!permisos?.create) {
      mostrarToast?.("No tienes permiso para iniciar conteos", "error");
      return;
    }

    if (!nuevoConteoData.almacen) {
      mostrarToast?.("Seleccione un almacén", "warning");
      return;
    }

    setLoading(true);
    try {
      await crearConteo(nuevoConteoData);
      mostrarToast?.("Sesión de conteo iniciada correctamente", "success");
      setIsModalOpen(false);
      setNuevoConteoData({ almacen: '', descripcion: '' });
    } catch (error) {
      mostrarToast?.("Error al iniciar el conteo", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    // 🛡️ 3. Verificación de permiso de eliminación
    if (!permisos?.delete) {
      mostrarToast?.("No tienes permiso para eliminar auditorías", "error");
      return;
    }

    if (window.confirm("¿Estás seguro de que deseas eliminar permanentemente esta auditoría física? Esta acción no se puede deshacer.")) {
      try {
        await eliminarConteo(id);
        mostrarToast?.("Auditoría eliminada correctamente", "success");
      } catch (error) {
        mostrarToast?.(error.message || "Error al eliminar la auditoría", "error");
      }
    }
  };

  // Función para abrir una sesión existente
  const handleContinuarConteo = async (conteo) => {
    setLoading(true);
    try {
      setConteoActivo(conteo);
      setViewMode('counting');
    } catch (error) {
      mostrarToast?.("No se pudo cargar la sesión", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado) => {
    const normalized = estado?.toLowerCase() || '';
    if (normalized.includes('publicado') || normalized.includes('finalizado')) {
      return <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm bg-emerald-500 text-white flex items-center gap-1"><CheckCircle size={8}/> Finalizado</span>;
    }
    if (normalized.includes('cancelado') || normalized.includes('anulado')) {
      return <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm bg-red-500 text-white flex items-center gap-1"><XCircle size={8}/> Anulado</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm bg-amber-500 text-white flex items-center gap-1"><Clock size={8}/> En Curso</span>;
  };

  // Renderizado condicional basado en el modo de vista
  if (viewMode === 'counting' && conteoActivo) {
    return <RegistroCantidades 
      conteo={conteoActivo} 
      onBack={() => { setViewMode('main'); cargarConteos(); }} 
      onReview={() => setViewMode('review')} // 🛡️ Pasamos permisos a sub-componentes
      mostrarToast={mostrarToast} 
      permisos={permisos}
    />;
  }

  if (viewMode === 'review' && conteoActivo) {
    return <RevisionVariaciones 
      conteo={conteoActivo} 
      onBack={() => setViewMode('counting')} 
      onFinish={() => { setViewMode('main'); cargarConteos(); }}
      mostrarToast={mostrarToast}
      permisos={permisos} // 🛡️ Pasamos permisos a sub-componentes
    />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera de Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand text-white rounded-xl shadow-lg shadow-indigo-100">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">Auditoría Física</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Conteo y Verificación de Stock</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setVista('grid')}
              className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${vista === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              title="Vista de Tarjetas"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setVista('lista')}
              className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${vista === 'lista' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              title="Vista de Tabla"
            >
              <List size={16} />
            </button>
          </div>
          {permisos?.create && ( // 🛡️ 4. Condicionamos el botón de "Iniciar Conteo"
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-brand transition-all active:scale-95"
            >
              <Plus size={16} /> Iniciar Conteo
            </button>
          )}
        </div>
      </div>

      {/* Vista de Cuadrícula (Estilo Producto) */}
      {vista === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3">
          {conteos.length > 0 ? (
            conteos.map(conteo => (
              <article key={conteo.id} className="group rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 z-10 bg-brand"></div>
                
                <div className="relative aspect-[2.5/1] bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                  <History size={32} className="text-brand/20" />
                  <div className="absolute left-2 top-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm bg-slate-900 text-white">Sesión</span>
                    {getStatusBadge(conteo.estado)}
                  </div>
                </div>

                <div className="p-3 space-y-2.5">
                  <div className="min-h-[3rem]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-tight truncate">{conteo.descripcion || 'Sin descripción'}</h3>
                        <p className="text-[9px] text-slate-400 font-bold tracking-tight italic">#{conteo.id.toString().padStart(4, '0')} · {new Date(conteo.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-slate-600">
                    <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Almacén Auditado</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Warehouse size={12} className="text-slate-400" />
                      <span className="text-[10px] font-black uppercase truncate">{conteo.almacen}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-emerald-600">
                      <p className="text-[8px] font-black uppercase tracking-wider opacity-70">Variación</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <BarChart3 size={12} />
                        <span className="text-[10px] font-black truncate">${Number(conteo.totalVariacion || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-slate-600">
                      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Registros</p>
                      <p className="mt-0.5 text-[10px] font-black uppercase truncate">{conteo.totalProductos || 0} items</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button 
                      disabled={conteo.estado === 'publicado' || conteo.estado === 'cancelado'}
                      onClick={() => handleContinuarConteo(conteo)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-all">
                    Continuar <ArrowRight size={12}/>
                  </button>
                  {permisos?.delete && ( // 🛡️ 5. Condicionamos el botón de eliminar
                    <button 
                      onClick={() => handleEliminar(conteo.id)}
                      className="h-8 w-8 flex items-center justify-center text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                      title="Eliminar Auditoría"
                    >
                      <Trash2 size={13}/>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))) : (
            <div className="col-span-full py-10 flex flex-col items-center gap-3">
              <ClipboardList size={32} className="text-slate-400" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-wider">No hay sesiones de conteo iniciadas</p>
              {permisos?.create && (
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-brand transition-all active:scale-95">
                  <Plus size={16} /> Iniciar Primer Conteo
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Vista de Lista (Tabla Técnica) */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-black tracking-widest italic">
              <tr>
                <th className="px-6 py-4">Auditoría / ID</th>
                <th className="px-6 py-4">Almacén</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {conteos.map(conteo => (
                <tr key={conteo.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ClipboardList size={16} className="text-brand" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 uppercase italic">{conteo.descripcion}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">#{conteo.id.toString().padStart(4, '0')} · {new Date(conteo.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{conteo.almacen || 'Principal'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 bg-indigo-50 text-brand rounded-md text-[9px] font-black">{conteo.totalProductos || 0} items</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(conteo.estado)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleContinuarConteo(conteo)} className="p-2 hover:text-brand transition-all"><ArrowRight size={14}/></button>
                      {permisos?.delete && ( // 🛡️ 6. Condicionamos el botón de eliminar en la lista
                        <button 
                          onClick={() => handleEliminar(conteo.id)}
                          className="p-2 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          title="Eliminar Auditoría"
                        ><Trash2 size={14}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para iniciar auditoría */}
      {isModalOpen && permisos?.create && ( // 🛡️ 7. Condicionamos el modal completo
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Iniciar Auditoría</h2>
                <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Conteo Físico de Stock</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 shadow-sm transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleCrearConteo} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Almacén a Auditar</label>
                <select 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-black text-[10px] uppercase text-slate-600 bg-white shadow-sm cursor-pointer"
                  value={nuevoConteoData.almacen}
                  onChange={e => setNuevoConteoData({...nuevoConteoData, almacen: e.target.value})}
                >
                  <option value="">Seleccionar Almacén...</option>
                  {almacenesDetallados.map(al => (
                    <option key={al.id} value={al.nombre}>{al.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Descripción / Motivo</label>
                <input 
                  placeholder="Ej: Auditoría Mensual" 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-sm text-slate-700 transition-all focus:bg-white" 
                  value={nuevoConteoData.descripcion} 
                  onChange={e => setNuevoConteoData({...nuevoConteoData, descripcion: e.target.value})} 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-600 transition-all uppercase text-[10px] tracking-[0.2em] disabled:opacity-50"
              >
                {loading ? 'Iniciando...' : 'Comenzar Auditoría'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-componente para el Registro de Cantidades (Escaneo)
const RegistroCantidades = ({ conteo, onBack, onReview, mostrarToast, permisos }) => {
  const { productos, agregarItemAConteo, actualizarItemConteo, obtenerConteo } = useInventario();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);

  const cargarItems = async () => {
    const data = await obtenerConteo(conteo.id);
    setItems(data.items || []);
  };

  useEffect(() => { cargarItems(); }, []);

  // Función para pre-cargar todos los productos que tienen stock en el almacén seleccionado
  const preCargarInventario = async () => {
    // 🛡️ 8. Verificación de permiso de creación/edición
    if (!permisos?.create) {
      mostrarToast?.("No tienes permiso para modificar la auditoría", "error");
      return;
    }

    setLoading(true);
    try {
      // Filtramos productos que pertenecen a este almacén o tienen stock registrado en él
      const prodsAlmacen = productos.filter(p => 
        p.almacen === conteo.almacen || 
        p.warehouseStocks?.some(ws => ws.almacen === conteo.almacen)
      );

      const idsExistentes = new Set(items.map(i => i.productoId));
      let agregados = 0;

      // Iteramos para agregar los productos faltantes a la sesión de conteo
      for (const p of prodsAlmacen) {
        if (!idsExistentes.has(p.id)) {
          await agregarItemAConteo(conteo.id, { productoId: p.id, cantidadContada: 0 });
          agregados++;
        }
      }

      if (agregados > 0) {
        await cargarItems();
        mostrarToast?.(`Se han reflejado ${agregados} productos del stock en la auditoría`, "success");
      } else {
        mostrarToast?.("El conteo ya refleja todos los productos del almacén", "info");
      }
    } catch (e) {
      mostrarToast?.("Error al sincronizar el stock con la auditoría", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (code) => {
    // 🛡️ 9. Verificación de permiso de creación/edición
    if (!permisos?.create) {
      mostrarToast?.("No tienes permiso para registrar items", "error");
      return;
    }

    const prod = productos.find(p => p.codigo === code);
    if (!prod) {
      mostrarToast?.(`Producto con código ${code} no encontrado`, "error");
      return;
    }

    const existing = items.find(i => i.productoId === prod.id);
    try {
      if (existing) {
        await actualizarItemConteo(conteo.id, existing.id, Number(existing.cantidadContada) + 1);
      } else {
        await agregarItemAConteo(conteo.id, { productoId: prod.id, cantidadContada: 1 });
      }
      mostrarToast?.(`${prod.nombre} registrado`, "success");
      cargarItems();
    } catch (e) {
      mostrarToast?.("Error al registrar item", "error");
    }
  };

  useScanner(handleScan, scannerRef);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-800 transition-all">
          <ChevronLeft size={16} /> Volver al Listado
        </button>
        <div className="flex gap-2">
          <button 
            disabled={loading || !permisos?.create}
            onClick={preCargarInventario}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Reflejar Stock Sistema
          </button>
          <button onClick={onReview} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-brand transition-all disabled:opacity-50"
            disabled={!permisos?.create}
          >
            Revisar Ajustes
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 bg-indigo-50 text-brand rounded-2xl flex items-center justify-center"><ScanLine size={28} /></div>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic">Registro de Stock</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{conteo.descripcion} — Almacén: {conteo.almacen}</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            ref={scannerRef}
            placeholder="Escanee código de barras o escriba manualmente..." 
            className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand font-bold text-sm transition-all"
            onKeyDown={(e) => { if(e.key === 'Enter') { handleScan(e.target.value); e.target.value = ''; } }}
          />
        </div>

        <div className="overflow-hidden border border-slate-100 rounded-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Sistema</th>
                <th className="px-6 py-4 text-center">Contado</th>
                <th className="px-6 py-4 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(item => (
                <tr key={item.id} className="font-bold text-xs">
                  <td className="px-6 py-4 uppercase text-slate-700">{item.productoNombre}</td>
                  <td className="px-6 py-4 text-slate-400">{item.cantidadSistema}</td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="number" 
                      className="w-20 p-2 border rounded-lg text-center font-black"
                      value={item.cantidadContada}
                      onChange={(e) => actualizarItemConteo(conteo.id, item.id, e.target.value).then(cargarItems)}
                    />
                  </td>
                  <td className={`px-6 py-4 text-right font-black ${item.diferencia < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {item.diferencia > 0 ? '+' : ''}{item.diferencia}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="4" className="py-10 text-center text-[10px] font-black text-slate-300 uppercase italic">Esperando escaneo de productos...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sub-componente para la Revisión de Variaciones Final
const RevisionVariaciones = ({ conteo, onBack, onFinish, mostrarToast, permisos }) => {
  const { obtenerConteo, publicarConteo } = useInventario();
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    obtenerConteo(conteo.id).then(setDatos);
  }, [conteo.id]);

  const handleFinalizar = async () => {
    // 🛡️ 10. Verificación final antes de la acción más crítica
    if (!permisos?.create) {
      mostrarToast?.("No tienes permiso para publicar los ajustes", "error");
      return;
    }

    if (!window.confirm("¿Confirma que desea aplicar estos ajustes al inventario real? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    try {
      await publicarConteo(conteo.id);
      mostrarToast?.("Ajustes aplicados correctamente", "success");
      onFinish();
    } catch (e) {
      mostrarToast?.("Error al publicar ajustes", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!datos) return <div className="py-20 text-center font-black uppercase text-slate-300">Cargando análisis...</div>;

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-100"><AlertTriangle size={24} /></div>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic">Revisión de Variaciones</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auditoría antes de publicación final</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-6 py-3 rounded-xl border border-slate-200 font-black text-[10px] uppercase hover:bg-slate-50 transition-all">Volver a Contar</button>
          <button 
            onClick={handleFinalizar}
            disabled={loading || !permisos?.create} // 🛡️ 11. Deshabilitamos el botón final
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-2"
          >
            <Save size={16} /> {loading ? 'Procesando...' : 'Aplicar Ajustes Reales'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Items Auditados</p>
          <h3 className="text-3xl font-black text-slate-800 italic">{datos.items?.length || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Variación Neta</p>
          <h3 className={`text-3xl font-black italic ${datos.totalVariacion < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            RD$ {Number(datos.totalVariacion || 0).toLocaleString()}
          </h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado de Auditoría</p>
          <h3 className="text-2xl font-black italic uppercase">Borrador</h3>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest italic">
            <tr>
              <th className="px-8 py-5">Producto</th>
              <th className="px-8 py-5 text-center">Sistema</th>
              <th className="px-8 py-5 text-center">Contado</th>
              <th className="px-8 py-5 text-right">Costo Variación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-bold">
            {datos.items?.map(item => (
              <tr key={item.id}>
                <td className="px-8 py-4 uppercase">{item.productoNombre}</td>
                <td className="px-8 py-4 text-center text-slate-400">{item.cantidadSistema}</td>
                <td className="px-8 py-4 text-center">{item.cantidadContada}</td>
                <td className={`px-8 py-4 text-right ${item.costoVariacion < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  RD$ {Number(item.costoVariacion || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConteoFisicoSection;