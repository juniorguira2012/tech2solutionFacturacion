import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Package, Tags, ArrowLeftRight, CheckCircle, Edit3,
  ClipboardList, Bell, Layers3, AlertTriangle, RefreshCw, Warehouse,
  Ruler, Braces, Plug, Truck, HandHelping, Wrench, Fingerprint, Lock
} from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions'; 
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
import ComodatoSection from './inventario/ComodatoSection';
import TecnicosSection from './inventario/TecnicosSection';
import SerialesSection from './inventario/SerialesSection';

const Inventario = () => {
  const { productos, categorias, setCategorias } = useInventario();
  const location = useLocation();
  const permisos = usePermissions('inventario'); // 🛡️ Captura: { view, create, edit, delete }
  const { usuario } = useAuth();

  const [toast, setToast] = useState({ show: false, mensaje: '', tipo: 'success' });
  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ show: true, mensaje, tipo });
    setTimeout(() => setToast({ show: false, mensaje: '', tipo: 'success' }), 3000);
  };

  const seccionesInventario = [
    { id: 'productos', label: 'Producto', icon: Package },
    { id: 'categoria', label: 'Categoría', icon: Tags },
    { id: 'movimiento', label: 'Movimiento de inventario', icon: ArrowLeftRight },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'almacen', label: 'Almacén', icon: Warehouse },
    { id: 'tecnicos', label: 'Técnicos', icon: Wrench },
    { id: 'conteo', label: 'Conteo Físico', icon: ClipboardList },
    { id: 'seriales', label: 'Seriales', icon: Fingerprint },
    { id: 'alerta', label: 'Alerta', icon: Bell },
    { id: 'lotes', label: 'Lotes Unidades', icon: Layers3 },
    { id: 'unidades', label: 'Unidades', icon: Ruler },
    { id: 'campos', label: 'Campos Personalizados', icon: Braces },
    { id: 'comodato', label: 'Comodato', icon: HandHelping },
    { id: 'integraciones', label: 'Integraciones', icon: Plug },
  ];

  // 🛡️ Filtramos las secciones que el usuario puede ver
  const seccionesVisibles = useMemo(() => {
    const esAdmin = usuario?.rol === 'admin';
    return seccionesInventario.filter(seccion => {
      if (esAdmin) return true;
      // Si no hay sub-módulos definidos, se asume acceso (comportamiento anterior)
      if (!permisos.subModulos) return true;
      // Si hay sub-módulos, se requiere el permiso de vista explícito
      return permisos.subModulos[seccion.id]?.view;
    });
  }, [permisos.subModulos, usuario?.rol]);

  const [seccionActiva, setSeccionActiva] = useState(() => {
    const savedTab = localStorage.getItem('posfactura_inventario_tab');
    // Si la pestaña guardada es visible, la usamos. Si no, la primera visible.
    if (savedTab && seccionesVisibles.some(s => s.id === savedTab)) {
      return savedTab;
    }
    return seccionesVisibles[0]?.id || null;
  });

  // Estado para pasar un producto a editar desde otra sección
  const [productoAEditar, setProductoAEditar] = useState(null);
  // Estado para iniciar una acción en una sección (ej: abrir modal de movimiento)
  const [accionInicial, setAccionInicial] = useState(null);


  const handleEditarProductoDesdeAlerta = (producto) => {
    setSeccionActiva('productos');
    setProductoAEditar(producto);
  };
  useEffect(() => {
    if (seccionActiva) {
      localStorage.setItem('posfactura_inventario_tab', seccionActiva);
    }
  }, [seccionActiva]);

  // Efecto para cambiar de pestaña desde una navegación externa (ej. Home)
  useEffect(() => {
    const { tab, accion, producto } = location.state || {};
    if (tab && seccionesVisibles.some(s => s.id === tab)) {
      setSeccionActiva(tab);
      if (accion) {
        // Preparamos la acción para que la sección correspondiente la ejecute
        setAccionInicial({ tipo: accion, producto: producto });
        navigate(location.pathname, { replace: true }); // Limpiamos el state para no repetir la acción
      }
    }
  }, [location.state, seccionesVisibles]);



  // Memo para productos con bajo stock
  const productosBajoStock = useMemo(() => {
    return productos.filter(p => p.isActive !== false && Number(p.stock) <= Number(p.stockMinimo ?? 5));
  }, [productos]);


  // 🛡️ Muro de seguridad global para el módulo
  if (!permisos.view) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-in fade-in duration-300">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-200 max-w-md">
          <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Acceso Restringido</h2>
          <p className="text-slate-500 font-medium mt-2">Tu perfil de usuario no tiene autorización para gestionar el inventario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-10 border-b border-slate-100">
          {seccionesVisibles.map(seccion => {
            const Icon = seccion.icon;
            const activo = seccionActiva === seccion.id;
            // 🛡️ Comprobamos si la sección actual es visible para el usuario
            const puedeVerSeccion = permisos.subModulos?.[seccion.id]?.view ?? true;

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
          {/* 🛡️ Renderizado condicional del contenido de la sección activa */}
          {seccionActiva === 'productos' && (permisos.subModulos?.productos?.view ?? true) && (
            <ProductosSection mostrarToast={mostrarToast} permisos={permisos} productoInicial={productoAEditar} />
          )}
          {seccionActiva === 'categoria' && (permisos.subModulos?.categoria?.view ?? true) && (
            <CategoriasSection categorias={categorias} setCategorias={setCategorias} mostrarToast={mostrarToast} permisos={permisos} />
          )}
          {seccionActiva === 'movimiento' && (permisos.subModulos?.movimiento?.view ?? true) && (
            <MovimientosSection mostrarToast={mostrarToast} permisos={permisos} accionInicial={accionInicial} />
          )}
          {seccionActiva === 'proveedores' && (permisos.subModulos?.proveedores?.view ?? true) && (
            <ProveedoresSection mostrarToast={mostrarToast} permisos={permisos} />
          )}
          {seccionActiva === 'almacen' && (permisos.subModulos?.almacen?.view ?? true) && (
            <AlmacenSection mostrarToast={mostrarToast} permisos={permisos} />
          )}
          {seccionActiva === 'tecnicos' && (permisos.subModulos?.tecnicos?.view ?? true) && (
            <TecnicosSection mostrarToast={mostrarToast} permisos={permisos} />
          )}
          {seccionActiva === 'conteo' && (permisos.subModulos?.conteo?.view ?? true) && (
            <ConteoFisicoSection mostrarToast={mostrarToast} permisos={permisos} />
          )}
          {seccionActiva === 'seriales' && (permisos.subModulos?.seriales?.view ?? true) && (
            <SerialesSection mostrarToast={mostrarToast} permisos={permisos.subModulos?.seriales} />
          )}
          {seccionActiva === 'alerta' && (permisos.subModulos?.alerta?.view ?? true) && (
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
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {productosBajoStock.length > 0 ? (
                   productosBajoStock.map(prod => (
                     <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                       <div className="flex justify-between items-start">
                         <h3 className="font-black text-slate-800 uppercase text-xs leading-tight">{prod.nombre}</h3>
                         <button onClick={() => handleEditarProductoDesdeAlerta(prod)} className="p-1.5 text-brand hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase ml-auto">
                           <Edit3 size={14}/>
                         </button>
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-center">
                         <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
                           <p className="text-[8px] font-black text-amber-600 uppercase">Mínimo</p>
                           <p className="text-sm font-black text-amber-700">{prod.stockMinimo ?? 5}</p>
                         </div>
                         <div className="bg-red-50 border border-red-100 rounded-lg p-2">
                           <p className="text-[8px] font-black text-red-600 uppercase">Actual</p>
                           <p className="text-sm font-black text-red-700">{prod.stock}</p>
                         </div>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-12 text-center text-xs font-black uppercase text-slate-400">No hay productos con stock crítico.</div>
                 )}
               </div>
             </div>
          )}
          {seccionActiva === 'comodato' && (permisos.subModulos?.comodato?.view ?? true) && (
            <ComodatoSection mostrarToast={mostrarToast} permisos={permisos} />
          )}
          {seccionActiva === 'lotes' && (permisos.subModulos?.lotes?.view ?? true) && (
            <LotesSection mostrarToast={mostrarToast} permisos={permisos} />
          )}
        </div>
      </section>

      {/* Secciones Renderizadas por Fuera de la Tarjeta Estándar */}
      {seccionActiva === 'unidades' && <UnidadesSection mostrarToast={mostrarToast} permisos={permisos} />}
      {seccionActiva === 'campos' && <CamposPersonalizadosSection mostrarToast={mostrarToast} permisos={permisos} />}
      {seccionActiva === 'integraciones' && <IntegracionesSection mostrarToast={mostrarToast} permisos={permisos} />}

      {/* TOAST ALERTS */}
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