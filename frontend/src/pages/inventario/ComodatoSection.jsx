import React, { useState, useEffect, useMemo } from 'react';
import { HandHelping, User, Clock, Calendar, Search, Plus, CheckCircle, History, RotateCcw, AlertTriangle } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';

const ComodatoSection = ({ mostrarToast, permisos }) => {
  // 🛡️ Extraemos los permisos específicos para esta sección
  const permisosComodato = permisos?.subModulos?.comodato ?? permisos;

  const { productos, prestamos, cargarPrestamos, crearPrestamo, devolverPrestamo } = useInventario();
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [devolviendo, setDevolviendo] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const [nuevoPrestamo, setNuevoPrestamo] = useState({
    productoId: '',
    responsable: '',
    nota: '',
    fechaEntrega: new Date().toISOString().slice(0, 16), // Fecha y hora actual
    fechaLimite: '' 
  });

  useEffect(() => {
    cargarPrestamos();
  }, [cargarPrestamos]);

  const registrarPrestamo = async (e) => {
    e.preventDefault();
    if (!permisosComodato?.create) {
      mostrarToast('No tienes permiso para registrar préstamos', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      await crearPrestamo({
        productoId: Number(nuevoPrestamo.productoId),
        responsable: nuevoPrestamo.responsable,
        nota: nuevoPrestamo.nota,
        fechaEntrega: nuevoPrestamo.fechaEntrega,
        fechaLimite: nuevoPrestamo.fechaLimite
      });
      
      setShowModal(false);
      setNuevoPrestamo({ productoId: '', responsable: '', nota: '', fechaLimite: '' });
      mostrarToast('Préstamo registrado y stock actualizado');
    } catch (error) {
      mostrarToast(error.message || 'Error al registrar entrega', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const manejarDevolucion = async (comodatoId) => {
    if (!permisosComodato?.edit) {
      mostrarToast('No tienes permiso para procesar devoluciones', 'error');
      return;
    }

    setDevolviendo(comodatoId);
    try {
      await devolverPrestamo(comodatoId);
      mostrarToast('Producto devuelto exitosamente al inventario');
    } catch (error) {
      mostrarToast(error.message || 'Error al devolver producto', 'error');
    } finally {
      setDevolviendo(null);
    }
  };

  // Filtro de registros (Estado + Búsqueda)
  const prestamosFiltrados = useMemo(() => {
    return prestamos.filter(item => {
      const coincideEstado = filtroEstado === 'todos' || item.estado === filtroEstado;
      
      const term = busqueda.toLowerCase();
      const coincideBusqueda = 
        (item.producto?.nombre || "").toLowerCase().includes(term) ||
        (item.responsable || "").toLowerCase().includes(term) ||
        (item.herramienta || "").toLowerCase().includes(term);

      return coincideEstado && coincideBusqueda;
    });
  }, [prestamos, filtroEstado, busqueda]);

  // Lógica para verificar si un préstamo está vencido o debe entregarse hoy
  const verificarAlerta = (item) => {
    if (item.estado !== 'activo' || !item.fechaLimite) return false;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Intentamos parsear la fecha límite (asumiendo formato ISO o YYYY-MM-DD)
    const limite = new Date(item.fechaLimite);
    // Ajustamos a medianoche para comparar solo fechas sin horas
    const limiteAjustado = new Date(limite.getFullYear(), limite.getMonth(), limite.getDate());
    limiteAjustado.setHours(0,0,0,0);

    // Retorna true si hoy es igual o mayor a la fecha límite
    return hoy >= limiteAjustado;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header de la sección */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md">
            <HandHelping size={20} />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Gestión de Comodato</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Control de herramientas prestadas</p>
          </div>
        </div>
        {permisosComodato?.create && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Plus size={14} /> Registrar Entrega
          </button>
        )}
      </div>

      {/* Toolbar de Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: 'todos', label: 'Ver Todos' },
            { id: 'activo', label: 'En Préstamo' },
            { id: 'devuelto', label: 'Devueltos' }
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => setFiltroEstado(f.id)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                filtroEstado === f.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por herramienta o responsable..." 
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand text-xs font-bold bg-white"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">Herramienta</th>
              <th className="px-6 py-4">Entregado a</th>
              <th className="px-6 py-4 text-center">Entrega</th>
              <th className="px-6 py-4 text-center">Fecha Límite</th>
              <th className="px-6 py-4 text-center">Devolución</th>
              <th className="px-6 py-4 text-center">Alerta</th>
              <th className="px-6 py-4 text-center">Estatus</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-bold text-xs">
            {prestamosFiltrados.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 uppercase text-slate-700 font-black italic">
                  {item.producto?.nombre || item.herramienta || 'Sin nombre'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <User size={12} className="text-brand" />
                    <span className="uppercase">{item.responsable}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Calendar size={10}/> {new Date(item.fechaEntrega || item.fechaCreacion).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase">
                      <Clock size={10}/> {new Date(item.fechaEntrega || item.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[10px] font-bold text-slate-500">
                    {item.fechaLimite ? new Date(item.fechaLimite).toLocaleDateString('es-DO') : 'Sin definir'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {item.fechaDevolucion ? (
                    <div className="flex flex-col items-center">
                      <span className="text-emerald-600 flex items-center gap-1 font-black">
                        <CheckCircle size={10}/> {new Date(item.fechaDevolucion).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] text-emerald-400 uppercase">
                        {new Date(item.fechaDevolucion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-300 italic text-[10px]">Pendiente</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {verificarAlerta(item) ? (
                    <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-[7px] font-black uppercase animate-pulse flex items-center justify-center gap-1 mx-auto w-fit shadow-lg shadow-red-100">
                      <AlertTriangle size={10} /> Devolución Pendiente
                    </div>
                  ) : (
                    <span className="text-slate-200 text-[10px]">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                    item.estado === 'activo' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                  }`}>
                    {item.estado === 'activo' ? 'Prestado' : 'Devuelto'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {item.estado === 'activo' && permisosComodato?.edit ? (
                    <>
                      <button
                        onClick={() => manejarDevolucion(item.id)}
                        disabled={devolviendo === item.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-[8px] font-black uppercase transition-all disabled:opacity-50"
                      >
                        <RotateCcw size={12} />
                        {devolviendo === item.id ? 'Devolviendo...' : 'Devolver'}
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-400 text-[8px] font-bold">Completado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Registro */}
      {showModal && permisosComodato?.create && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 tracking-tighter italic uppercase">Nueva Entrega</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={registrarPrestamo} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Herramienta</label>
                <select 
                  required
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand font-black text-[10px] uppercase text-slate-700 bg-white"
                  value={nuevoPrestamo.productoId}
                  onChange={(e) => setNuevoPrestamo({...nuevoPrestamo, productoId: e.target.value})}
                >
                  <option value="">Seleccione Producto...</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Persona Responsable</label>
                <input 
                  required
                  type="text"
                  placeholder="NOMBRE DEL EMPLEADO O CLIENTE"
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand font-bold text-sm uppercase"
                  value={nuevoPrestamo.responsable}
                  onChange={(e) => setNuevoPrestamo({...nuevoPrestamo, responsable: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha y Hora de Entrega</label>
                <input 
                  required
                  type="datetime-local"
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand font-bold text-sm"
                  value={nuevoPrestamo.fechaEntrega}
                  onChange={(e) => setNuevoPrestamo({...nuevoPrestamo, fechaEntrega: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Límite de Devolución</label>
                <input 
                  required // Ahora es obligatorio
                  type="date"
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand font-bold text-sm"
                  value={nuevoPrestamo.fechaLimite}
                  onChange={(e) => setNuevoPrestamo({...nuevoPrestamo, fechaLimite: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observaciones / Notas</label>
                <textarea 
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand font-bold text-sm resize-none"
                  rows="2"
                  placeholder="Ej. Se entrega con estuche y cargador..."
                  value={nuevoPrestamo.nota}
                  onChange={(e) => setNuevoPrestamo({...nuevoPrestamo, nota: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-brand transition-all mt-4 uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {isSaving ? 'Procesando...' : 'Confirmar Salida en Comodato'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComodatoSection;