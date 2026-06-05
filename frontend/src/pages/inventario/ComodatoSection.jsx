import React, { useState, useEffect } from 'react';
import { HandHelping, User, Clock, Calendar, Search, Plus, CheckCircle, History, RotateCcw } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';

const ComodatoSection = ({ mostrarToast }) => {
  const { productos, prestamos, cargarPrestamos, crearPrestamo, devolverPrestamo } = useInventario();
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [devolviendo, setDevolviendo] = useState(null);

  const [nuevoPrestamo, setNuevoPrestamo] = useState({
    productoId: '',
    responsable: '',
    nota: ''
  });

  useEffect(() => {
    cargarPrestamos();
  }, [cargarPrestamos]);

  const registrarPrestamo = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await crearPrestamo({
        productoId: Number(nuevoPrestamo.productoId),
        responsable: nuevoPrestamo.responsable,
        nota: nuevoPrestamo.nota
      });
      
      setShowModal(false);
      setNuevoPrestamo({ productoId: '', responsable: '', nota: '' });
      mostrarToast('Préstamo registrado y stock actualizado');
    } catch (error) {
      mostrarToast(error.message || 'Error al registrar entrega', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const manejarDevolucion = async (comodatoId) => {
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
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <Plus size={14} /> Registrar Entrega
        </button>
      </div>

      {/* Tabla de Registros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">Herramienta</th>
              <th className="px-6 py-4">Entregado a</th>
              <th className="px-6 py-4 text-center">Fecha y Hora</th>
              <th className="px-6 py-4 text-center">Estatus</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-bold text-xs">
            {prestamos.map((item) => (
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
                      <Calendar size={10}/> {new Date(item.fechaCreacion || item.fecha).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase">
                      <Clock size={10}/> {new Date(item.fechaCreacion || item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                    item.estado === 'activo' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                  }`}>
                    {item.estado === 'activo' ? 'Prestado' : 'Devuelto'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {item.estado === 'activo' ? (
                    <button
                      onClick={() => manejarDevolucion(item.id)}
                      disabled={devolviendo === item.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-[8px] font-black uppercase transition-all disabled:opacity-50"
                    >
                      <RotateCcw size={12} />
                      {devolviendo === item.id ? 'Devolviendo...' : 'Devolver'}
                    </button>
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
      {showModal && (
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