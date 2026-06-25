import React, { useState, useEffect, useMemo } from 'react';
import { Search, Tag, Edit, ChevronLeft, ChevronRight, History, X, Package, User, Warehouse } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';

const SerialesSection = ({ mostrarToast }) => {
  const { seriales, cargarSeriales, actualizarEstadoSerial, obtenerHistorialSerial } = useInventario();
  const [busqueda, setBusqueda] = useState('');
  const [editingStatusId, setEditingStatusId] = useState(null); // ID del serial cuyo estado se está editando
  const [loading, setLoading] = useState(false);
  
  // --- Estados para el modal de historial ---
  const [historialModalOpen, setHistorialModalOpen] = useState(false);
  const [serialSeleccionado, setSerialSeleccionado] = useState(null);
  const [historialData, setHistorialData] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // --- Estados para la paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    cargarSeriales();
  }, [cargarSeriales]);

  // Lista de estados posibles para el dropdown.
  // Coincide con el Enum del backend.
  const statusOptions = ['disponible', 'vendido', 'en_reparacion', 'descartado', 'en_comodato'];

  const serialesFiltrados = useMemo(() => {
    if (!busqueda.trim()) {
      return seriales;
    }
    const busquedaLower = busqueda.toLowerCase();
    return seriales.filter(s =>
      s.serialNumber.toLowerCase().includes(busquedaLower) ||
      s.producto?.nombre.toLowerCase().includes(busquedaLower) ||
      s.producto?.codigo?.toLowerCase().includes(busquedaLower)
    );
  }, [seriales, busqueda]);

  // --- Lógica de paginación ---
  const totalPages = useMemo(() => {
    return Math.ceil(serialesFiltrados.length / itemsPerPage);
  }, [serialesFiltrados, itemsPerPage]);

  const paginatedSeriales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return serialesFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [serialesFiltrados, currentPage, itemsPerPage]);

  // Resetear a la página 1 cuando se realiza una búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, itemsPerPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponible': return 'bg-emerald-100 text-emerald-800';
      case 'vendido': return 'bg-sky-100 text-sky-800';
      case 'en_reparacion': return 'bg-amber-100 text-amber-800';
      case 'descartado': return 'bg-rose-100 text-rose-800';
      case 'en_comodato': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleStatusChange = async (serialId, nuevoEstado) => {
    setLoading(true);
    try {
      await actualizarEstadoSerial(serialId, nuevoEstado);
      mostrarToast?.(`Estado del serial actualizado a "${nuevoEstado.replace('_', ' ')}"`, 'success');
    } catch (error) {
      mostrarToast?.(error.message || 'No se pudo cambiar el estado', 'error');
    } finally {
      setEditingStatusId(null); // Cierra el dropdown
      setLoading(false);
    }
  };

  const abrirModalHistorial = async (serial) => {
    setSerialSeleccionado(serial);
    setHistorialModalOpen(true);
    setLoadingHistorial(true);
    try {
      const data = await obtenerHistorialSerial(serial.serialNumber);
      setHistorialData(data);
    } catch (error) {
      mostrarToast?.('No se pudo cargar el historial', 'error');
      setHistorialData([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const cerrarModalHistorial = () => {
    setHistorialModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand text-white rounded-xl shadow-lg shadow-indigo-100">
            <Tag size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">Gestión de Seriales</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Auditoría y Trazabilidad de Productos</p>
          </div>
        </div>
        <div className="relative lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por serial, nombre o código de producto..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-brand font-bold text-xs bg-white shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {paginatedSeriales.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b text-[9px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Serial</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Almacén</th>
                <th className="px-6 py-4">Fecha de Ingreso</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y text-[11px]">
              {paginatedSeriales.map((serial) => (
                <tr key={serial.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-black text-brand uppercase cursor-pointer hover:underline" onClick={() => abrirModalHistorial(serial)}>{serial.serialNumber}</td>
                  <td className="px-6 py-3 font-bold text-slate-800 uppercase">{serial.producto?.nombre || 'N/A'}</td>
                  <td className="px-6 py-3 relative">
                    {editingStatusId === serial.id ? (
                      <select
                        value={serial.status}
                        onChange={(e) => handleStatusChange(serial.id, e.target.value)}
                        onBlur={() => setEditingStatusId(null)}
                        className="w-full p-1 border rounded-md text-[9px] font-bold uppercase focus:outline-brand"
                        autoFocus
                        disabled={loading}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingStatusId(serial.id)}
                        className={`group flex items-center gap-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase transition-all ${getStatusColor(serial.status)} hover:ring-2 hover:ring-brand`}
                        disabled={loading}
                      >
                        {serial.status.replace('_', ' ')}
                        <Edit className="opacity-0 group-hover:opacity-100 transition-opacity" size={10} />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">{serial.almacen}</td>
                  <td className="px-6 py-3 font-bold text-slate-500">{new Date(serial.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => abrirModalHistorial(serial)} className="p-1.5 text-slate-400 hover:text-brand hover:bg-indigo-50 rounded-lg transition-colors">
                      <History size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-20 text-center space-y-3">
            <Tag className="mx-auto text-slate-200" size={40} />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No se encontraron seriales</p>
          </div>
        )}
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <span className="text-[10px] font-bold text-slate-500">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md bg-slate-100 text-slate-600 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md bg-slate-100 text-slate-600 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Historial */}
      {historialModalOpen && serialSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={cerrarModalHistorial}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase">Historial del Serial: {serialSeleccionado.serialNumber}</h3>
                <p className="text-[10px] font-bold text-slate-500">{serialSeleccionado.producto?.nombre}</p>
              </div>
              <button onClick={cerrarModalHistorial} className="p-2 rounded-full hover:bg-slate-200"><X size={18} /></button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {/* Aquí iría la tabla o lista del historial */}
              <p className="text-center text-sm text-slate-400">Historial de movimientos...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SerialesSection;