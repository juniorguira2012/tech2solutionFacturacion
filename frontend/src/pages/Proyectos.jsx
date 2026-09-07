import React, { useEffect, useMemo, useState } from 'react';
import { Cable, DollarSign, Edit3, Plus, Ruler, Trash2, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import AccessDeniedAlert from '../components/AccessDeniedAlert';

const initialForm = {
  nombre: '', descripcion: '', cliente: '', zona: '', estado: 'planificado', presupuesto: 0, inversion: 0,
  kilometrosPlanificados: 0, kilometrosInstalados: 0, tipoFibra: '', cantidadFibraPlanificada: 0,
  cantidadFibraUsada: 0, fechaInicio: '', fechaFin: '',
};

const estadoLabels = {
  planificado: 'Planificado', en_ejecucion: 'En ejecución', pausado: 'Pausado',
  completado: 'Completado', cancelado: 'Cancelado',
};

const Proyectos = () => {
  const { usuario } = useAuth();
  const permisos = usePermissions('proyectos');
  const [proyectos, setProyectos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL?.includes('inventario.oneredrd.com')
    ? '/api' : (import.meta.env.VITE_API_URL || '/api');

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('posfactura_token') || ''}`,
  });

  const cargarProyectos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, { headers: headers() });
      if (!response.ok) throw new Error('No se pudieron cargar los proyectos');
      setProyectos(await response.json());
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (usuario) cargarProyectos(); }, [usuario]);

  const visibles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return proyectos;
    return proyectos.filter(project => [project.nombre, project.cliente, project.zona, project.estado]
      .some(value => String(value || '').toLowerCase().includes(query)));
  }, [proyectos, search]);

  const resumen = useMemo(() => proyectos.reduce((total, project) => ({
    presupuesto: total.presupuesto + Number(project.presupuesto || 0),
    inversion: total.inversion + Number(project.inversion || 0),
    kmPlanificados: total.kmPlanificados + Number(project.kilometrosPlanificados || 0),
    kmInstalados: total.kmInstalados + Number(project.kilometrosInstalados || 0),
  }), { presupuesto: 0, inversion: 0, kmPlanificados: 0, kmInstalados: 0 }), [proyectos]);

  const abrirNuevo = () => { setEditingId(null); setForm(initialForm); setModalOpen(true); };
  const editar = project => {
    setEditingId(project.id);
    setForm({ ...initialForm, ...project, presupuesto: Number(project.presupuesto || 0), inversion: Number(project.inversion || 0) });
    setModalOpen(true);
  };

  const guardar = async event => {
    event.preventDefault();
    setSaving(true);
    try {
      const url = `${API_BASE_URL}/projects${editingId ? `/${editingId}` : ''}`;
      const response = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: headers(), body: JSON.stringify({
        ...form,
        presupuesto: Number(form.presupuesto), inversion: Number(form.inversion),
        kilometrosPlanificados: Number(form.kilometrosPlanificados), kilometrosInstalados: Number(form.kilometrosInstalados),
        cantidadFibraPlanificada: Number(form.cantidadFibraPlanificada), cantidadFibraUsada: Number(form.cantidadFibraUsada),
      }) });
      if (!response.ok) throw new Error('No se pudo guardar el proyecto');
      await cargarProyectos(); setModalOpen(false); setForm(initialForm);
    } catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  };

  const eliminar = async id => {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE', headers: headers() });
    if (response.ok) setProyectos(prev => prev.filter(project => project.id !== id));
    else setError('No se pudo eliminar el proyecto');
  };

  if (!permisos.view) return <AccessDeniedAlert modulo="los proyectos de fibra" />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Planificación de fibra óptica</p><h1 className="mt-1 text-2xl font-black uppercase italic text-slate-800">Proyectos</h1><p className="mt-1 text-xs text-slate-400">Control de inversión, metraje y avance de instalación.</p></div>
        {permisos.create && <button onClick={abrirNuevo} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand"><Plus size={16} /> Nuevo proyecto</button>}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        {[['Presupuesto', resumen.presupuesto, DollarSign, 'text-indigo-600'], ['Inversión', resumen.inversion, TrendingUp, 'text-amber-600'], ['Km planificados', resumen.kmPlanificados, Ruler, 'text-sky-600'], ['Km instalados', resumen.kmInstalados, Cable, 'text-emerald-600']].map(([label, value, Icon, color]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon size={18} className={color} /><p className="mt-4 text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p><p className="mt-1 text-xl font-black text-slate-800">{label.includes('Km') ? `${value.toFixed(3)} km` : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</p></div>)}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between"><h2 className="text-xs font-black uppercase tracking-widest text-slate-700">Registro de proyectos</h2><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar proyecto, cliente o zona..." className="h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-brand md:w-80" /></div>
        {loading ? <p className="p-10 text-center text-xs font-bold text-slate-400">Cargando proyectos...</p> : error ? <p className="p-10 text-center text-xs font-bold text-rose-500">{error}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-400"><tr>{['Proyecto', 'Zona / cliente', 'Estado', 'Presupuesto', 'Inversión', 'Fibra', 'Avance', 'Acciones'].map(head => <th key={head} className="px-5 py-4">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 text-xs">{visibles.map(project => { const avance = Number(project.kilometrosPlanificados) ? Math.min(100, Number(project.kilometrosInstalados) / Number(project.kilometrosPlanificados) * 100) : 0; return <tr key={project.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-black uppercase text-slate-800">{project.nombre}</p><p className="mt-1 text-[10px] text-slate-400">{project.tipoFibra || 'Tipo no definido'}</p></td><td className="px-5 py-4"><p className="font-bold text-slate-600">{project.zona || 'Sin zona'}</p><p className="text-[10px] text-slate-400">{project.cliente || 'Sin cliente'}</p></td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase text-slate-600">{estadoLabels[project.estado] || project.estado}</span></td><td className="px-5 py-4 font-bold">${Number(project.presupuesto || 0).toLocaleString()}</td><td className="px-5 py-4 font-bold text-amber-600">${Number(project.inversion || 0).toLocaleString()}</td><td className="px-5 py-4"><p>{Number(project.kilometrosInstalados || 0).toFixed(3)} / {Number(project.kilometrosPlanificados || 0).toFixed(3)} km</p><p className="text-[10px] text-slate-400">{project.cantidadFibraUsada || 0} / {project.cantidadFibraPlanificada || 0} unidades</p></td><td className="px-5 py-4"><div className="h-2 w-24 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${avance}%` }} /></div><p className="mt-1 text-[10px] font-bold text-slate-500">{avance.toFixed(0)}%</p></td><td className="px-5 py-4"><div className="flex gap-2">{permisos.edit && <button onClick={() => editar(project)} title="Editar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand"><Edit3 size={15} /></button>}{permisos.delete && <button onClick={() => eliminar(project.id)} title="Eliminar" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={15} /></button>}</div></td></tr>; })}</tbody></table>{visibles.length === 0 && <p className="p-10 text-center text-xs font-bold text-slate-400">No hay proyectos registrados.</p>}</div>}
      </section>

      {modalOpen && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4"><form onSubmit={guardar} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-black uppercase italic text-slate-800">{editingId ? 'Editar proyecto' : 'Nuevo proyecto'}</h2><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div><div className="grid gap-4 md:grid-cols-2">{[['nombre','Nombre del proyecto'],['cliente','Cliente'],['zona','Zona'],['tipoFibra','Tipo de fibra'],['presupuesto','Presupuesto'],['inversion','Inversión ejecutada'],['kilometrosPlanificados','Km planificados'],['kilometrosInstalados','Km instalados'],['cantidadFibraPlanificada','Cantidad de fibra planificada'],['cantidadFibraUsada','Cantidad de fibra usada'],['fechaInicio','Fecha de inicio'],['fechaFin','Fecha de fin']].map(([key,label]) => <label key={key} className="space-y-1 text-[10px] font-black uppercase text-slate-400">{label}<input required={key === 'nombre'} type={key.includes('fecha') ? 'date' : ['presupuesto','inversion','kilometrosPlanificados','kilometrosInstalados','cantidadFibraPlanificada','cantidadFibraUsada'].includes(key) ? 'number' : 'text'} step={key.includes('kilometros') ? '0.001' : '0.01'} min={['presupuesto','inversion','kilometrosPlanificados','kilometrosInstalados','cantidadFibraPlanificada','cantidadFibraUsada'].includes(key) ? '0' : undefined} value={form[key] || ''} onChange={event => setForm(prev => ({ ...prev, [key]: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold normal-case outline-none focus:border-brand" /></label>)}<label className="space-y-1 text-[10px] font-black uppercase text-slate-400">Estado<select value={form.estado} onChange={event => setForm(prev => ({ ...prev, estado: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold normal-case outline-none focus:border-brand">{Object.entries(estadoLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="space-y-1 text-[10px] font-black uppercase text-slate-400 md:col-span-2">Descripción<textarea value={form.descripcion} onChange={event => setForm(prev => ({ ...prev, descripcion: event.target.value }))} className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-xs font-bold normal-case outline-none focus:border-brand" /></label></div><button disabled={saving} className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar proyecto'}</button></form></div>}
    </div>
  );
};

export default Proyectos;
