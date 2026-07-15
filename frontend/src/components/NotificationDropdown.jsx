import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventario } from '../context/InventarioContext';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Package, ArrowLeftRight, KeyRound, Check, Trash2 } from 'lucide-react';

const NotificationDropdown = ({ onClose, onCountChange }) => {
  const navigate = useNavigate();
  const { prestamos, productos, movimientos } = useInventario();
  
  // 1. Primero obtenemos los datos del contexto
  const { usuario, getAuthHeaders } = useAuth(); 

  // 2. Inicializamos los estados del componente
  const [fadingOut, setFadingOut] = useState(new Set());
  const [dismissedNotifications, setDismissedNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('posfactura_dismissed_notifications');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      return new Set();
    }
  });

  // 4. Otras funciones del componente
  const dismissNotification = (type, id) => {
    const notificationId = `${type}-${id}`;
    setFadingOut(prev => new Set(prev).add(notificationId));
    setTimeout(() => {
      setDismissedNotifications(prev => new Set(prev).add(notificationId));
      setFadingOut(prev => { 
        const newSet = new Set(prev); 
        newSet.delete(notificationId); 
        return newSet; 
      });
    }, 300);
  };

  const comodatosVencidos = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return prestamos.filter(item => !dismissedNotifications.has(`comodato-${item.id}`) && (() => {
      if (item.estado !== 'activo' || !item.fechaLimite) return false;
      const limite = new Date(item.fechaLimite);
      const limiteAjustado = new Date(limite.getFullYear(), limite.getMonth(), limite.getDate());
      limiteAjustado.setHours(0, 0, 0, 0);
      return hoy >= limiteAjustado;
    })());
  }, [prestamos, dismissedNotifications]);

  const productosBajoStock = useMemo(() => {
    return productos.filter(p => !dismissedNotifications.has(`producto-${p.id}`) && p.isActive !== false && Number(p.stock) <= Number(p.stockMinimo ?? 5));
  }, [productos, dismissedNotifications]);

  const movimientosRecientes = useMemo(() => {
    return movimientos.filter(m => !dismissedNotifications.has(`movimiento-${m.id}`)).slice(0, 5);
  }, [movimientos, dismissedNotifications]);

  // --- CÁLCULO DEL TOTAL Y COMUNICACIÓN AL PADRE ---
  const totalNotificacionesVisibles = useMemo(() => {
    return comodatosVencidos.length + productosBajoStock.length + movimientosRecientes.length;
  }, [comodatosVencidos, productosBajoStock, movimientosRecientes]);
  
  useEffect(() => {
    // 🚀 MEJORA: Comunicamos el total de notificaciones al componente padre (Layout).
    onCountChange(totalNotificacionesVisibles);
  }, [totalNotificacionesVisibles, onCountChange]);
  
  const clearAllNotifications = () => {
    const allIds = [
      ...comodatosVencidos.map(i => `comodato-${i.id}`),
      ...productosBajoStock.map(i => `producto-${i.id}`),
      ...movimientosRecientes.map(i => `movimiento-${i.id}`)
    ];
    setDismissedNotifications(new Set(allIds));
  };

  const handleNavigation = (path, state) => {
    navigate(path, { state });
    onClose(); // Cierra el dropdown después de navegar
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 mt-2 w-[90vw] max-w-sm sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notificaciones</h3>
          <button onClick={clearAllNotifications} className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors text-[9px] font-bold uppercase">
            <Trash2 size={12} />
            Limpiar
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
          {/* Sección de Comodatos Vencidos */}
          {comodatosVencidos.length > 0 ? (
            comodatosVencidos.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  dismissNotification('comodato', item.id);
                  handleNavigation('/inventario', { tab: 'comodato' });
                }}
                className={`p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-all duration-300 ${
                  fadingOut.has(`comodato-${item.id}`) ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <UserCircle size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-slate-800 uppercase truncate">{item.responsable}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase truncate">
                      {item.producto?.nombre || item.herramienta || 'Herramienta'}
                    </p>
                    <p className="text-[8px] font-black text-rose-500 uppercase mt-1">
                      Venció: {new Date(item.fechaLimite).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Check size={24} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase">Todo al día</p>
            </div>
          )}

          {/* Sección de Productos con Bajo Stock */}
          <div className="p-4 bg-slate-50 border-y border-slate-100 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bajo Stock</h3>
            <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{productosBajoStock.length}</span>
          </div>
          {productosBajoStock.length > 0 ? (
            productosBajoStock.map((producto) => (
              <div
                key={producto.id}
                onClick={() => {
                  dismissNotification('producto', producto.id);
                  handleNavigation('/inventario', { tab: 'alerta' });
                }}
                className={`p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-all duration-300 ${
                  fadingOut.has(`producto-${producto.id}`) ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <Package size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-slate-800 uppercase truncate">{producto.nombre}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase truncate">
                      Stock Actual: <span className="text-red-500">{producto.stock}</span> (Mín: {producto.stockMinimo ?? 5})
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Check size={24} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase">Stock saludable</p>
            </div>
          )}

          {/* Sección de Movimientos Recientes */}
          <div className="p-4 bg-slate-50 border-y border-slate-100 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Movimientos Recientes</h3>
            <span className="bg-sky-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{movimientosRecientes.length}</span>
          </div>
          {movimientosRecientes.length > 0 ? (
            movimientosRecientes.map((mov) => (
              <div
                key={mov.id}
                onClick={() => {
                  dismissNotification('movimiento', mov.id);
                  handleNavigation('/inventario', { tab: 'movimiento' });
                }}
                className={`p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-all duration-300 ${
                  fadingOut.has(`movimiento-${mov.id}`) ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    mov.tipo.includes('RECIBIR') ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'
                  }`}>
                    <ArrowLeftRight size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-slate-800 uppercase truncate">{mov.producto?.nombre}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase truncate">
                      {mov.tipo} ({mov.cantidad} uds) - {mov.usuario?.nombre || 'Sistema'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Check size={24} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase">Sin movimientos hoy</p>
            </div>
          )}

        </div>

        <div className="flex border-t border-slate-100 shrink-0">
          <button
            onClick={() => handleNavigation('/inventario')}
            className="w-full p-3 bg-slate-50 text-brand text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors "
          >
            Ir al Inventario
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;