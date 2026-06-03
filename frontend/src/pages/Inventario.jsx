import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Package, Tags, ArrowLeftRight, CheckCircle,
  ClipboardList, Bell, Layers3, AlertTriangle, RefreshCw,
  Warehouse, Ruler, Braces, Plug, Truck
} from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import AlmacenSection from './inventario/AlmacenSection';
import CategoriasSection from './inventario/CategoriasSection';
import MovimientosSection from './inventario/MovimientosSection';
import ConteoFisicoSection from './inventario/ConteoFisicoSection';
import UnidadesSection from './inventario/UnidadesSection';
import ProductosSection from './inventario/ProductosSection';
import CamposPersonalizadosSection from './inventario/CamposPersonalizadosSection';
import IntegracionesSection from './inventario/IntegracionesSection';
import ProveedoresSection from './inventario/ProveedoresSection';
import LotesSection from './inventario/LotesSection';

const Inventario = () => {
  const { productos, categorias, setCategorias } = useInventario();
  const location = useLocation();

  const [toast, setToast] = useState({ show: false, mensaje: '', tipo: 'success' });
  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ show: true, mensaje, tipo });
    setTimeout(() => setToast({ show: false, mensaje: '', tipo: 'success' }), 3000);
  };

  const [seccionActiva, setSeccionActiva] = useState(() => {
    return localStorage.getItem('posfactura_inventario_tab') || 'productos';
  });

  useEffect(() => {
    localStorage.setItem('posfactura_inventario_tab', seccionActiva);
  }, [seccionActiva]);

  // Capturar el redireccionamiento desde el Home para Stock Crítico
  useEffect(() => {
    if (location.state?.filter === 'low_stock') {
      setSeccionActiva('alerta');
    }
  }, [location.state]);

  const LOW_STOCK_THRESHOLD = 5;

  const seccionesInventario = [
    { id: 'productos', label: 'Producto', icon: Package },
    { id: 'categoria', label: 'Categoría', icon: Tags },
    { id: 'movimiento', label: 'Movimiento de inventario', icon: ArrowLeftRight },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'almacen', label: 'Almacén', icon: Warehouse },
    { id: 'conteo', label: 'Conteo Físico', icon: ClipboardList },
    { id: 'alerta', label: 'Alerta', icon: Bell },
    { id: 'lotes', label: 'Lotes Unidades', icon: Layers3 },
    { id: 'unidades', label: 'Unidades', icon: Ruler },
    { id: 'campos', label: 'Campos Personalizados', icon: Braces },
    { id: 'integraciones', label: 'Integraciones', icon: Plug },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 border-b border-slate-100">
          {seccionesInventario.map(seccion => {
            const Icon = seccion.icon;
            const activo = seccionActiva === seccion.id;

            return (
              <button
                key={seccion.id}
                type="button"
                onClick={() => setSeccionActiva(seccion.id)}
                className={`h-14 px-2 flex flex-col items-center justify-center gap-1 border-r border-b xl:border-b-0 border-slate-100 transition-all ${
                  activo ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={15} />
                <span className="text-[8px] font-black uppercase tracking-wider text-center leading-tight">{seccion.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3 space-y-3">
          {seccionActiva === 'productos' ? (
            <ProductosSection mostrarToast={mostrarToast} />
          ) : seccionActiva === 'categoria' ? (
            <CategoriasSection categorias={categorias} setCategorias={setCategorias} mostrarToast={mostrarToast} />
          ) : seccionActiva === 'movimiento' ? (
            <MovimientosSection />
          ) : seccionActiva === 'proveedores' ? (
            <ProveedoresSection mostrarToast={mostrarToast} />
          ) : seccionActiva === 'almacen' ? (
            <AlmacenSection mostrarToast={mostrarToast} />
          ) : seccionActiva === 'conteo' ? (
            <ConteoFisicoSection mostrarToast={mostrarToast} />
        ) : seccionActiva === 'alerta' ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
                <Bell size={18} />
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Alertas Inventario</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Productos con existencias críticas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {productos.filter(p => (Number(p.stock) || 0) <= LOW_STOCK_THRESHOLD && p.categoria !== 'Servicios').map(p => (
                <article key={p.id} className="p-4 bg-white border border-red-100 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
                  <AlertTriangle className="text-red-500 shrink-0" size={20} />
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-black uppercase text-slate-700 truncate">{p.nombre}</h4>
                    <p className="text-[9px] font-bold text-red-500 italic uppercase">Stock crítico: {p.stock} uds</p>
                  </div>
                </article>
              ))}
              {productos.filter(p => (Number(p.stock) || 0) <= LOW_STOCK_THRESHOLD && p.categoria !== 'Servicios').length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No hay alertas de stock en este momento</p>
                </div>
              )}
            </div>
          </div>
          ) : seccionActiva === 'lotes' ? (
            <LotesSection />
          ) : null}
        </div>
      </section>

      {seccionActiva === 'unidades' && <UnidadesSection />}

      {seccionActiva === 'campos' && <CamposPersonalizadosSection />}

      {seccionActiva === 'integraciones' && <IntegracionesSection />}

      {/* TOAST NOTIFICATION (Opcional, para que se vea si lo usas) */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300 ${
          toast.tipo === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="text-[10px] font-black uppercase tracking-widest">{toast.mensaje}</p>
        </div>
      )}
    </div>
  );
};

export default Inventario;