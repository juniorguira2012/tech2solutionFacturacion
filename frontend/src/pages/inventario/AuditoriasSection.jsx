import React, { useEffect, useState } from 'react';
import { Trash2, FileText, RefreshCw, Plus, X, ChevronLeft } from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';
import { useAuth } from '../../context/AuthContext';

// Componente de Modal de Confirmación (reutilizado de ProductosSection.jsx)
const ConfirmModal = ({ isOpen, onConfirm, onCancel, titulo, descripcion, tipo = 'danger' }) => {
  if (!isOpen) return null;

  const esEliminar = tipo === 'danger';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Icono */}
        <div className={`flex justify-center pt-8 pb-4`}>
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${esEliminar ? 'bg-red-50' : 'bg-amber-50'}`}>
            <RefreshCw size={32} className={esEliminar ? 'text-red-500' : 'text-amber-500'} />
          </div>
        </div>

        {/* Texto */}
        <div className="px-8 pb-6 text-center space-y-2">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">{titulo}</h3>
          <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{descripcion}</p>
        </div>

        {/* Acciones */}
        <div className="flex border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors border-r border-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-white transition-colors ${
              esEliminar ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {esEliminar ? 'Eliminar' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AuditoriaDetalle = ({ audit, onBack }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-800 transition-all">
        <ChevronLeft size={16} /> Volver al Listado
      </button>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic">Detalle de Auditoría #{audit.id}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{audit.descripcion || 'Sin descripción'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
            <span className="px-3 py-1 bg-brand/10 text-brand rounded-full text-[10px] font-black uppercase">{audit.estado}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Almacén Auditado</p>
                <p className="text-xs font-bold text-slate-700 uppercase">{audit.almacen}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fecha de Registro</p>
                <p className="text-xs font-bold text-slate-700">{new Date(audit.createdAt).toLocaleString()}</p>
            </div>
        </div>

        <div className="overflow-hidden border border-slate-100 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4 text-center">Stock Sistema</th>
                <th className="px-6 py-4 text-center">Stock Contado</th>
                <th className="px-6 py-4 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {audit.items?.map(item => (
                <tr key={item.id} className="text-xs font-bold">
                  <td className="px-6 py-4 uppercase text-slate-700">{item.productoNombre}</td>
                  <td className="px-6 py-4 text-center text-slate-400">{item.cantidadSistema}</td>
                  <td className="px-6 py-4 text-center">{item.cantidadContada}</td>
                  <td className={`px-6 py-4 text-right font-black ${item.diferencia < 0 ? 'text-red-500' : item.diferencia > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {item.diferencia > 0 ? '+' : ''}{item.diferencia}
                  </td>
                </tr>
              ))}
              {(!audit.items || audit.items.length === 0) && (
                <tr><td colSpan="4" className="py-10 text-center text-[10px] font-black text-slate-300 uppercase italic">No hay productos registrados en esta auditoría</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AuditoriasSection = ({ mostrarToast }) => {
  const { conteos, cargarConteos, eliminarConteo, obtenerConteo, loading } = useInventario();
  const { usuario } = useAuth();
  const [auditDetail, setAuditDetail] = useState(null);

  // Estado para el modal de confirmación
  const [confirm, setConfirm] = useState({
    isOpen: false,
    titulo: '',
    descripcion: '',
    tipo: 'danger',
    onConfirm: null,
  });

  const mostrarConfirm = ({ titulo, descripcion, tipo = 'danger', onConfirm }) => {
    setConfirm({ isOpen: true, titulo, descripcion, tipo, onConfirm });
  };

  const cerrarConfirm = () => {
    setConfirm({ isOpen: false, titulo: '', descripcion: '', tipo: 'danger', onConfirm: null });
  };

  useEffect(() => {
    cargarConteos(); // Cargar los conteos al montar el componente
  }, [cargarConteos]);

  const handleEliminar = (id) => {
    mostrarConfirm({
      titulo: '¿Eliminar Auditoría Física?',
      descripcion: 'Esta acción eliminará permanentemente la auditoría y sus registros. ¿Estás seguro?',
      tipo: 'danger',
      onConfirm: async () => {
        try {
          await eliminarConteo(id);
          mostrarToast?.('Auditoría eliminada con éxito', 'success');
        } catch (error) {
          mostrarToast?.(error.message || 'Error al eliminar auditoría', 'error');
        } finally {
          cerrarConfirm();
        }
      },
    });
  };

  const handleVerDetalle = async (id) => {
    try {
      const data = await obtenerConteo(id);
      setAuditDetail(data);
    } catch (error) {
      mostrarToast?.('Error al cargar detalle de auditoría', 'error');
    }
  };

  if (auditDetail) {
    return <AuditoriaDetalle audit={auditDetail} onBack={() => setAuditDetail(null)} />;
  }

  return (
    <div className="space-y-4">
      <ConfirmModal
        isOpen={confirm.isOpen}
        titulo={confirm.titulo}
        descripcion={confirm.descripcion}
        tipo={confirm.tipo}
        onConfirm={confirm.onConfirm}
        onCancel={cerrarConfirm}
      />

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 uppercase italic">Auditorías Físicas</h2>
        <button className="h-9 w-9 flex items-center justify-center bg-brand text-white rounded-lg shadow-sm hover:bg-indigo-600"><Plus size={18}/></button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="py-20 text-center text-xs font-black uppercase text-slate-400">Cargando auditorías...</div>
        ) : conteos.length === 0 ? (
          <div className="py-20 text-center text-xs font-black uppercase text-slate-400">No hay auditorías registradas</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[9px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Almacén</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha Creación</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {conteos.map(conteo => (
                <tr key={conteo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-black text-slate-700 uppercase text-xs">{conteo.id}</td>
                  <td className="px-6 py-3">{conteo.almacen}</td>
                  <td className="px-6 py-3">{conteo.descripcion || 'N/A'}</td>
                  <td className="px-6 py-3">{conteo.estado}</td>
                  <td className="px-6 py-3">{new Date(conteo.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleVerDetalle(conteo.id)} className="p-1.5 text-brand hover:bg-indigo-50 rounded-lg transition-colors" title="Ver Detalle">
                        <FileText size={16}/>
                      </button>
                      {usuario?.rol === 'admin' && (
                        <button onClick={() => handleEliminar(conteo.id)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Eliminar Auditoría">
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditoriasSection;