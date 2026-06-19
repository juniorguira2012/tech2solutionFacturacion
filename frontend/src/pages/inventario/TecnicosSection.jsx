import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, ClipboardList, Edit2, Mail, PackageSearch, Phone, Search, Trash2, UserCheck, UserPlus, Wrench, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventario } from '../../context/InventarioContext';

const TecnicosSection = ({ mostrarToast }) => {
  const {
    productos,
    movimientos,
    tecnicos,
    registrarMovimiento,
    crearTecnico,
    actualizarTecnico,
    eliminarTecnico,
    cargarMovimientos,
    recargarInventario,
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

  const entregasRecientes = useMemo(() => (
    movimientos
      .filter(m => m.tipo === 'DESPACHAR' && (m.technician || String(m.nota || '').includes('Entrega a técnico:')))
      .slice(0, 8)
  ), [movimientos]);

  const tecnicosOrdenados = useMemo(() => (
    [...tecnicos].sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || '')))
  ), [tecnicos]);

  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [form, setForm] = useState({
    productoId: '',
    cantidad: 1,
    almacen: '',
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
      almacen: '',
      tecnicoId: '',
      tecnicoManual: '',
      referencia: '',
      nota: ''
    });
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
    setEditandoTecnicoId(null);
    setFormTecnico({ nombre: '', telefono: '', email: '' });
    setModalTecnicoOpen(true);
  };

  const abrirEditarTecnico = (tecnico) => {
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

  const entregarProducto = async (e) => {
    e.preventDefault();

    if (!productoSeleccionado) {
      mostrarToast?.('Selecciona un producto válido', 'error');
      return;
    }

    const cantidad = Number(form.cantidad);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      mostrarToast?.('La cantidad debe ser mayor a 0', 'error');
      return;
    }

    const nombreTecnico = obtenerNombreTecnico();
    if (!nombreTecnico) {
      mostrarToast?.('Selecciona o escribe el técnico responsable', 'error');
      return;
    }

    if (!form.almacen) {
      mostrarToast?.('Selecciona el almacén de salida', 'error');
      return;
    }

    setGuardando(true);
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-4">
          {tecnicosOrdenados.map(tecnico => (
            <article key={tecnico.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-black text-slate-800 uppercase truncate">{tecnico.nombre}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => abrirEditarTecnico(tecnico)}
                    className="h-7 w-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-brand hover:border-brand/30 flex items-center justify-center transition-colors"
                    title="Editar técnico"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => borrarTecnico(tecnico)}
                    className="h-7 w-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors"
                    title="Eliminar técnico"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
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
            </article>
          ))}
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
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cantidad</label>
              <input
                type="number"
                min="1"
                required
                value={form.cantidad}
                onChange={(e) => setForm(prev => ({ ...prev, cantidad: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-black text-xs bg-white"
              />
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
            disabled={guardando}
            className="w-full h-12 bg-slate-900 hover:bg-brand disabled:opacity-60 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            {guardando ? 'Registrando...' : 'Confirmar entrega'}
          </button>
        </form>

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

      {modalTecnicoOpen && (
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
