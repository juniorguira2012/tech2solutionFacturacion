import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, ClipboardList, Edit2, Mail, PackageSearch, Phone, Search, Trash2, UserCheck, UserPlus, Wrench, X, RotateCcw, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventario } from '../../context/InventarioContext';

const TecnicosSection = ({ mostrarToast, permisos }) => { // 🛡️ 1. Recibimos los permisos

  const {
    seriales,
    movimientos,
    tecnicos,
    devolverSerialTecnico,
    registrarMovimiento,
    crearTecnico,
    asignarSerialesTecnico,
    actualizarTecnico,
    eliminarTecnico,
    cargarMovimientos,
    recargarInventario,
    productos,
    almacenesDetallados
  } = useInventario();
  const { usuario } = useAuth();

  const almacenesNombres = useMemo(
    () => almacenesDetallados.map(a => a.nombre).filter(Boolean),
    [almacenesDetallados]
  );

  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  const entregasRecientes = useMemo(() => {
    // Filtro mejorado: Muestra cualquier despacho que tenga un `technicianId`
    // O cuya nota comience con "Entrega a técnico:", para incluir también
    // las entregas a técnicos manuales (sin ID).
    return movimientos
      .filter(m => m.tipo === 'DESPACHAR' && 
        (m.technicianId || m.nota?.startsWith('Entrega a técnico:')))
      .slice(0, 8);
  }, [movimientos]);

  const tecnicosOrdenados = useMemo(() => (
    [...tecnicos].sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || '')))
  ), [tecnicos]);

  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [form, setForm] = useState({
    productoId: '',
    cantidad: 1,
    almacen: '',
    serialsInput: '',
    tecnicoId: '',
    tecnicoManual: '',
    referencia: '',
    nota: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [modalTecnicoOpen, setModalTecnicoOpen] = useState(false);
  const [guardandoTecnico, setGuardandoTecnico] = useState(false);
  const [editandoTecnicoId, setEditandoTecnicoId] = useState(null);
  const [formTecnico, setFormTecnico] = useState({
    nombre: '',
    telefono: '',
    email: ''
  });
  // Estados para el nuevo modal de devolución masiva
  const [devolucionModalOpen, setDevolucionModalOpen] = useState(false);
  const [devolucionSerialesInput, setDevolucionSerialesInput] = useState('');
  const [devolucionNota, setDevolucionNota] = useState(''); // <-- Nuevo estado para la nota
  const [devolucionLoading, setDevolucionLoading] = useState(false);



  const productosFiltrados = useMemo(() => {
    const query = busquedaProducto.trim().toLowerCase();
    if (!query) return [];
    return productos
      .filter(p => (
        p.nombre?.toLowerCase().includes(query) ||
        p.codigo?.toLowerCase().includes(query)
      ))
      .slice(0, 8);
  }, [busquedaProducto, productos]);

  const productoSeleccionado = useMemo(
    () => productos.find(p => Number(p.id) === Number(form.productoId)),
    [productos, form.productoId]
  );

  const seleccionarProducto = (producto) => {
    setForm(prev => ({
      ...prev,
      productoId: producto.id,
      almacen: prev.almacen || producto.almacen || almacenesNombres[0] || 'Principal'
    }));
    setBusquedaProducto(`${producto.nombre}${producto.codigo ? ` (${producto.codigo})` : ''}`);
  };

  const limpiarProducto = () => {
    setForm(prev => ({ ...prev, productoId: '' }));
    setBusquedaProducto('');
  };

  const resetForm = () => {
    setBusquedaProducto('');
    setForm({
      productoId: '',
      cantidad: 1,
      serialsInput: '',
      almacen: '',
      tecnicoId: '',
      tecnicoManual: '',
      referencia: '',
      nota: ''
    });
    setExpandedTechnician(null);
  };

  const obtenerNombreTecnico = () => {
    const tecnicoSeleccionado = tecnicosOrdenados.find(t => String(t.id) === String(form.tecnicoId));
    return tecnicoSeleccionado?.nombre || form.tecnicoManual.trim();
  };

  const cerrarModalTecnico = () => {
    setModalTecnicoOpen(false);
    setEditandoTecnicoId(null);
    setFormTecnico({ nombre: '', telefono: '', email: '' });
  };

  const abrirNuevoTecnico = () => {
    // 🛡️ 2. Verificación de permiso de creación
    if (!permisos.create) {
      return mostrarToast('No tienes permiso para registrar nuevos técnicos', 'error');
    }
    setEditandoTecnicoId(null);
    setFormTecnico({ nombre: '', telefono: '', email: '' });
    setModalTecnicoOpen(true);
  };

  const abrirEditarTecnico = (tecnico) => {
    // 🛡️ 3. Verificación de permiso de edición
    if (!permisos.edit) {
      return mostrarToast('No tienes permiso para editar técnicos', 'error');
    }
    setEditandoTecnicoId(tecnico.id);
    setFormTecnico({
      nombre: tecnico.nombre || '',
      telefono: tecnico.telefono || '',
      email: tecnico.email || ''
    });
    setModalTecnicoOpen(true);
  };

  const guardarTecnico = async (e) => {
    e.preventDefault();
    const nombre = formTecnico.nombre.trim();

    if (!nombre) {
      mostrarToast?.('El nombre del técnico es obligatorio', 'error');
      return;
    }

    // 🛡️ 4. Verificación de permisos de creación/edición
    if ((editandoTecnicoId && !permisos.edit) || (!editandoTecnicoId && !permisos.create)) {
      mostrarToast("No tienes permiso para realizar esta acción", "error");
      return;
    }

    setGuardandoTecnico(true);
    try {
      const payload = {
        nombre,
        telefono: formTecnico.telefono.trim() || undefined,
        email: formTecnico.email.trim() || undefined
      };

      const tecnico = editandoTecnicoId
        ? await actualizarTecnico(editandoTecnicoId, payload)
        : await crearTecnico(payload);

      setForm(prev => ({
        ...prev,
        tecnicoId: tecnico.id,
        tecnicoManual: ''
      }));
      mostrarToast?.(`Técnico ${tecnico.nombre} ${editandoTecnicoId ? 'actualizado' : 'registrado'}`, 'success');
      cerrarModalTecnico();
    } catch (error) {
      mostrarToast?.(error.message || 'No se pudo guardar el técnico', 'error');
    } finally {
      setGuardandoTecnico(false);
    }
  };

  const borrarTecnico = async (tecnico) => {
    // 🛡️ 5. Verificación de permiso de eliminación
    if (!permisos.delete) {
      return mostrarToast('No tienes permiso para eliminar técnicos', 'error');
    }

    const confirmar = window.confirm(`¿Eliminar a ${tecnico.nombre} del catálogo de técnicos?`);
    if (!confirmar) return;

    try {
      await eliminarTecnico(tecnico.id);
      if (String(form.tecnicoId) === String(tecnico.id)) {
        setForm(prev => ({ ...prev, tecnicoId: '' }));
      }
      mostrarToast?.(`Técnico ${tecnico.nombre} eliminado del catálogo`, 'success');
    } catch (error) {
      mostrarToast?.(error.message || 'No se pudo eliminar el técnico', 'error');
    }
  };

  const [expandedTechnician, setExpandedTechnician] = useState(null);

  // Al inicio de tu componente TecnicoSection, asegúrate de estar extrayendo el usuario:
// const { user } = useAuth(); o la forma en que consumas tu contexto global.

const handleDevolverSerial = async (serialNumber) => {
  // 1. Pedimos una nota al usuario. Si cancela, la función termina.
  const nota = window.prompt(`Introduce una nota para la devolución del serial ${serialNumber}:`, 'Devuelto por técnico');
  if (nota === null) {
    mostrarToast?.('Devolución cancelada.', 'info');
    return;
  }

  try {
    // 2. Pasamos la nota capturada a la función del contexto.
    await devolverSerialTecnico(serialNumber, nota, usuario);
    mostrarToast?.(`Serial ${serialNumber} devuelto al inventario`, 'success');
  } catch (error) {
    mostrarToast?.(error.message || 'No se pudo procesar la devolución', 'error');
  }
};

  const handleDevolucionMasiva = async (e) => {
    // 🛡️ 6. Verificación de permiso de creación (ya que genera un movimiento de entrada)
    if (!permisos.create) {
      return mostrarToast('No tienes permiso para procesar devoluciones', 'error');
    }

    e.preventDefault();
    const serialesADevolver = devolucionSerialesInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

    if (serialesADevolver.length === 0) {
      mostrarToast?.('Ingresa al menos un número de serie.', 'warning');
      return;
    }

    setDevolucionLoading(true);
    let exitosos = 0;
    let fallidos = 0;
    const errores = [];

    for (const serial of serialesADevolver) {
      try {
        // 3. Usamos la nota del formulario del modal. Si está vacía, ponemos un texto por defecto.
        await devolverSerialTecnico(
          serial, 
          devolucionNota.trim() || 'Devolución masiva desde módulo de técnicos', 
          usuario);
        exitosos++;
      } catch (error) {
        fallidos++;
        errores.push(`Serial ${serial}: ${error.message}`);
      }
    }

    // Manejo de respuestas finales (Toasts de éxito o errores acumulados)
    setDevolucionLoading(false);
    if (errores.length > 0) {
      console.error("Errores en devolución masiva:", errores);
      mostrarToast?.(`Procesados: ${exitosos} éxitos, ${fallidos} fallas.`, 'error');
    } else {
      mostrarToast?.(`Se devolvieron ${exitosos} seriales correctamente.`, 'success');
      // 4. Limpiamos y cerramos el modal al finalizar con éxito.
      setDevolucionModalOpen(false);
      setDevolucionSerialesInput('');
      setDevolucionNota('');
    }
  };
  const entregarProducto = async (e) => {
    e.preventDefault();
    // 🛡️ 7. Verificación de permiso de creación (ya que genera un movimiento de salida)
    if (!permisos.create) {
      return mostrarToast('No tienes permiso para registrar entregas', 'error');
    }

    if (!productoSeleccionado) {
      mostrarToast?.('Selecciona un producto válido', 'error');
      return;
    }

    setGuardando(true);

    // --- LÓGICA PARA PRODUCTOS SERIALIZADOS ---
    if (productoSeleccionado.isSerialized) {
      const serials = form.serialsInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      if (serials.length === 0) {
        mostrarToast?.('Debes ingresar al menos un número de serie.', 'warning');
        setGuardando(false);
        return;
      }

      const tecnicoId = form.tecnicoId ? Number(form.tecnicoId) : undefined;
      if (!tecnicoId) {
        mostrarToast?.('Debes seleccionar un técnico del catálogo para asignar seriales.', 'error');
        setGuardando(false);
        return;
      }

      const nombreTecnico = obtenerNombreTecnico();
      const nota = [
        `Entrega a técnico: ${nombreTecnico}`,
        form.referencia ? `Referencia: ${form.referencia}` : '',
        form.nota ? `Nota: ${form.nota}` : ''
      ].filter(Boolean).join(' | ');

      try {
        await asignarSerialesTecnico({
          technicianId: tecnicoId,
          serials: serials,
          usuarioId: Number(usuario?.id),
          nota: nota,
        });
        mostrarToast?.(`${serials.length} serial(es) asignado(s) a ${obtenerNombreTecnico()}`, 'success');
        recargarInventario();
        resetForm();
      } catch (error) {
        mostrarToast?.(error.message || 'No se pudo asignar los seriales', 'error');
      } finally {
        setGuardando(false);
      }
      return; // Finaliza el flujo para serializados
    }

    // --- LÓGICA PARA PRODUCTOS POR CANTIDAD (EXISTENTE) ---
    const nombreTecnico = obtenerNombreTecnico();
    if (!nombreTecnico) {
      mostrarToast?.('Selecciona o escribe el técnico responsable', 'error');
      return;
    }

    if (!form.almacen) {
      mostrarToast?.('Selecciona el almacén de salida', 'error');
      return;
    }

    const cantidad = Number(form.cantidad);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      mostrarToast?.('La cantidad debe ser mayor a 0', 'error');
      setGuardando(false);
      return;
    }
    try {
      const nota = [
        `Entrega a técnico: ${nombreTecnico}`,
        form.referencia ? `Referencia: ${form.referencia}` : '',
        form.nota ? `Nota: ${form.nota}` : ''
      ].filter(Boolean).join(' | ');

      await registrarMovimiento({
        productoId: Number(productoSeleccionado.id),
        tipo: 'DESPACHAR',
        cantidad,
        almacenOrigen: form.almacen,
        almacenDestino: form.almacen,
        technicianId: form.tecnicoId ? Number(form.tecnicoId) : undefined,
        technicianName: form.tecnicoId ? undefined : nombreTecnico,
        referencia: form.referencia || undefined,
        nota,
        usuarioId: usuario?.id ? String(usuario.id) : undefined
      });

      mostrarToast?.(`Producto entregado a ${nombreTecnico}`, 'success');
      recargarInventario();
      resetForm();
    } catch (error) {
      mostrarToast?.(error.message || 'No se pudo registrar la entrega', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-100">
            <Wrench size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">Entrega a técnicos</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Salida controlada desde almacén</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-white border border-slate-200 rounded-xl px-4 py-3">
          <ClipboardList size={15} />
          {entregasRecientes.length} entrega{entregasRecientes.length === 1 ? '' : 's'} recientes
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <UserCheck size={18} className="text-brand" />
            <div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Catálogo de técnicos</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tecnicosOrdenados.length} registrado{tecnicosOrdenados.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={abrirNuevoTecnico}
            className="h-11 px-4 bg-slate-900 hover:bg-brand text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <UserPlus size={15} />
            Nuevo técnico
          </button>
          <button
            type="button"
            onClick={() => setDevolucionModalOpen(true)}
            className="h-11 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Undo2 size={15} /> Devolver Equipo
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-4">
          {tecnicosOrdenados.map(tecnico => {
            const serialesAsignados = seriales.filter(s => 
              s.status === 'asignado_tecnico' && Number(s.technicianId) === Number(tecnico.id)
            );

            return (
            <article key={tecnico.id} className="border border-slate-100 rounded-xl bg-slate-50/50 min-w-0 flex flex-col">
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-black text-slate-800 uppercase truncate">{tecnico.nombre}</p>
                  {/* 🛡️ 9. Condicionamos los botones de acción por fila */}
                  {(permisos.edit || permisos.delete) && (
                    <div className="flex items-center gap-1 shrink-0">
                      {permisos.edit && (
                        <button
                          type="button"
                          onClick={() => abrirEditarTecnico(tecnico)}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-brand hover:border-brand/30 flex items-center justify-center transition-colors"
                          title="Editar técnico"
                        ><Edit2 size={13} /></button>
                      )}
                      {permisos.delete && (
                        <button
                          type="button"
                          onClick={() => borrarTecnico(tecnico)}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors"
                          title="Eliminar técnico"
                        ><Trash2 size={13} /></button>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <p className="flex items-center gap-2 text-[9px] font-bold text-slate-400 truncate">
                    <Phone size={12} className="shrink-0" />
                    {tecnico.telefono || 'Sin teléfono'}
                  </p>
                  <p className="flex items-center gap-2 text-[9px] font-bold text-slate-400 truncate">
                    <Mail size={12} className="shrink-0" />
                    {tecnico.email || 'Sin email'}
                  </p>
                </div>
              </div>
              {serialesAsignados.length > 0 && (
                <div className="mt-auto pt-2 border-t border-slate-200">
                  <button onClick={() => setExpandedTechnician(expandedTechnician === tecnico.id ? null : tecnico.id)} className="w-full flex justify-between items-center px-3 py-1 text-left">
                    <span className="text-[9px] font-black text-brand uppercase">Equipos Asignados ({serialesAsignados.length})</span>
                    {expandedTechnician === tecnico.id ? <ChevronUp size={14} className="text-brand" /> : <ChevronDown size={14} className="text-brand" />}
                  </button>
                  {expandedTechnician === tecnico.id && (
                    <div className="p-2 space-y-1 max-h-32 overflow-y-auto">
                      {serialesAsignados.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-1.5 bg-white rounded-md border">
                          <span className="text-[9px] font-mono font-bold text-slate-600">{s.serialNumber}</span>
                          <button onClick={() => handleDevolverSerial(s.serialNumber)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-md"><RotateCcw size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          )})}
          {tecnicosOrdenados.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-4 py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <UserPlus className="mx-auto text-slate-200" size={34} />
              <p className="mt-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">No hay técnicos registrados</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
        <form onSubmit={entregarProducto} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1 relative lg:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Producto</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => {
                    setBusquedaProducto(e.target.value);
                    setForm(prev => ({ ...prev, productoId: '' }));
                  }}
                  placeholder="Buscar por nombre o código..."
                  className="w-full h-12 pl-10 pr-11 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
                />
                {form.productoId && (
                  <button type="button" onClick={limpiarProducto} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500">
                    <X size={16} />
                  </button>
                )}
              </div>
              {productosFiltrados.length > 0 && !form.productoId && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 p-2 max-h-56 overflow-y-auto">
                  {productosFiltrados.map(producto => (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => seleccionarProducto(producto)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl text-left transition-colors"
                    >
                      <span className="min-w-0">
                        <span className="block text-[10px] font-black text-slate-700 uppercase truncate">{producto.nombre}</span>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase">{producto.codigo || 'Sin código'}</span>
                      </span>
                      <span className="text-[9px] font-black text-brand shrink-0">Stock: {producto.stock}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Almacén de salida</label>
              <select
                required
                value={form.almacen}
                onChange={(e) => setForm(prev => ({ ...prev, almacen: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
              >
                <option value="">Seleccionar almacén...</option>
                {(almacenesNombres.length > 0 ? almacenesNombres : ['Principal']).map(almacen => (
                  <option key={almacen} value={almacen}>{almacen}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                {productoSeleccionado?.isSerialized ? 'Seriales (uno por línea)' : 'Cantidad'}
              </label>
              {productoSeleccionado?.isSerialized ? (
                <textarea
                  required
                  value={form.serialsInput}
                  onChange={(e) => setForm(prev => ({ ...prev, serialsInput: e.target.value }))}
                  placeholder="SN-001&#10;SN-002&#10;SN-003"
                  className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-mono text-xs bg-white h-24 resize-y"
                />
              ) : (
                <input
                  type="number"
                  min="1"
                  required
                  value={form.cantidad}
                  onChange={(e) => setForm(prev => ({ ...prev, cantidad: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-black text-xs bg-white"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Técnico</label>
              <select
                value={form.tecnicoId}
                onChange={(e) => setForm(prev => ({ ...prev, tecnicoId: e.target.value, tecnicoManual: '' }))}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
              >
                <option value="">Seleccionar técnico...</option>
                {tecnicosOrdenados.map(tecnico => (
                  <option key={tecnico.id} value={tecnico.id}>{tecnico.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Técnico manual</label>
              <input
                type="text"
                value={form.tecnicoManual}
                onChange={(e) => setForm(prev => ({ ...prev, tecnicoManual: e.target.value, tecnicoId: '' }))}
                placeholder="Nombre si no tiene usuario..."
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Orden / referencia</label>
              <input
                type="text"
                value={form.referencia}
                onChange={(e) => setForm(prev => ({ ...prev, referencia: e.target.value }))}
                placeholder="Ticket, OT, instalación..."
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nota</label>
              <input
                type="text"
                value={form.nota}
                onChange={(e) => setForm(prev => ({ ...prev, nota: e.target.value }))}
                placeholder="Uso previsto o detalle..."
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
              />
            </div>
          </div>

          {productoSeleccionado && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <PackageSearch className="text-brand shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-800 uppercase truncate">{productoSeleccionado.nombre}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Stock global: {productoSeleccionado.stock} | Almacén base: {productoSeleccionado.almacen || 'N/A'}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={guardando || !permisos.create} // 🛡️ 10. Deshabilitamos si no hay permiso
            className="w-full h-12 bg-slate-900 hover:bg-brand disabled:opacity-60 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            {guardando ? 'Registrando...' : 'Confirmar entrega'}
          </button>
        </form>

        {/* Modal de Devolución Masiva */}
        {devolucionModalOpen && permisos.create && ( // 🛡️ 11. Condicionamos el modal
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                    <Undo2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase italic tracking-wider">Devolución de Técnico</h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reingresar seriales al stock</p>
                  </div>
                </div>
                <button type="button" onClick={() => setDevolucionModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleDevolucionMasiva} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Seriales a Devolver (uno por línea)</label>
                  <textarea
                    required
                    value={devolucionSerialesInput}
                    onChange={(e) => setDevolucionSerialesInput(e.target.value)}
                    placeholder="SN-DEV-001&#10;SN-DEV-002&#10;SN-DEV-003"
                    className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-mono text-xs bg-white h-48 resize-y"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nota de Devolución (Opcional)</label>
                  <input
                    type="text"
                    value={devolucionNota}
                    onChange={(e) => setDevolucionNota(e.target.value)}
                    placeholder="Ej: Equipo defectuoso, fin de proyecto..."
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={devolucionLoading}
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  {devolucionLoading ? 'Procesando...' : 'Confirmar Devolución'}
                </button>
              </form>
            </div>
          </div>
        )}
        <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <UserCheck size={18} className="text-brand" />
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Entregas recientes</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
            {entregasRecientes.map(entrega => (
              <div key={entrega.id} className="p-4 space-y-1">
                <p className="text-[10px] font-black text-slate-800 uppercase leading-tight">{entrega.producto?.nombre || 'Producto'}</p>
                <p className="text-[9px] font-black text-brand uppercase">{entrega.technician?.nombre || 'Técnico en nota'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Cant. {entrega.cantidad} | {entrega.almacenOrigen || entrega.almacenDestino || 'Almacén'}</p>
                <p className="text-[9px] font-bold text-slate-500 leading-relaxed">{entrega.nota}</p>
              </div>
            ))}
            {entregasRecientes.length === 0 && (
              <div className="py-16 px-6 text-center">
                <Wrench className="mx-auto text-slate-200" size={36} />
                <p className="mt-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin entregas registradas</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {modalTecnicoOpen && (permisos.create || permisos.edit) && ( // 🛡️ 12. Condicionamos el modal
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase italic tracking-wider">{editandoTecnicoId ? 'Editar técnico' : 'Nuevo técnico'}</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registro en base de datos</p>
                </div>
              </div>
              <button type="button" onClick={cerrarModalTecnico} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarTecnico} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formTecnico.nombre}
                  onChange={(e) => setFormTecnico(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre del técnico..."
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Teléfono</label>
                <input
                  type="tel"
                  value={formTecnico.telefono}
                  onChange={(e) => setFormTecnico(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="809-000-0000"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email</label>
                <input
                  type="email"
                  value={formTecnico.email}
                  onChange={(e) => setFormTecnico(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="correo@empresa.com"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={guardandoTecnico}
                className="w-full h-12 bg-slate-900 hover:bg-brand disabled:opacity-60 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                {guardandoTecnico ? 'Guardando...' : editandoTecnicoId ? 'Actualizar técnico' : 'Guardar técnico'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TecnicosSection;
