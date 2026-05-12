import React, { useState, useMemo, useEffect } from 'react';
import {
  Package, Search, Edit3, Trash2, Plus, X, 
  FileText, BarChart3, AlertTriangle, Lock,
  Warehouse, MapPin, Settings,
  PlusCircle, MinusCircle, Tags, ArrowLeftRight, CheckCircle,
  ClipboardList, Bell, Layers3, Image,
  Ruler, Braces, Plug, Upload, LayoutGrid, List
} from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useAuth } from '../context/AuthContext';
import AlmacenSection from './inventario/AlmacenSection';
import CategoriasSection from './inventario/CategoriasSection';
import MovimientosSection from './inventario/MovimientosSection';
import ConteoFisicoSection from './inventario/ConteoFisicoSection';
import UnidadesSection from './inventario/UnidadesSection';
import CamposPersonalizadosSection from './inventario/CamposPersonalizadosSection';
import IntegracionesSection from './inventario/IntegracionesSection';

const Inventario = () => {
  const {
    productos, 
    loading,
    errorConexion,
    agregarProducto,
    actualizarProducto,
    recargarInventario,
  } = useInventario();
  const { usuario } = useAuth();

  const [toast, setToast] = useState({ show: false, mensaje: '', tipo: 'success' });
  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ show: true, mensaje, tipo });
    setTimeout(() => setToast({ show: false, mensaje: '', tipo: 'success' }), 3000);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [seccionActiva, setSeccionActiva] = useState(() => {
    return localStorage.getItem('posfactura_inventario_tab') || 'productos';
  });

  const [vista, setVista] = useState(() => {
    return localStorage.getItem('posfactura_inventario_vista') || 'grid';
  });

  useEffect(() => {
    localStorage.setItem('posfactura_inventario_vista', vista);
  }, [vista]);

  useEffect(() => {
    localStorage.setItem('posfactura_inventario_tab', seccionActiva);
  }, [seccionActiva]);

  const [filtroProducto, setFiltroProducto] = useState('todos');
  const [searchTerm, setSearchTerm] = useState("");
  const [almacenFiltro, setAlmacenFiltro] = useState('todos');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('todas');
  const [filtroLote, setFiltroLote] = useState('Todos');
  const [searchTermLote, setSearchTermLote] = useState("");
  const [camposPersonalizados, setCamposPersonalizados] = useState([]);
  const [nuevoCampo, setNuevoCampo] = useState({ nombre: '', valor: '' });
  const [showNuevoCampo, setShowNuevoCampo] = useState(false);


  // Constantes para opciones de select (mejora de mantenibilidad)
  const [categorias, setCategorias] = useState(() => {
    const saved = localStorage.getItem('posfactura_categorias');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migración: Si eran strings, los convertimos a objetos con color
      return parsed.map(c => typeof c === 'string' ? { nombre: c, color: '#4f46e5' } : c);
    }
    return [
      { nombre: 'General', color: '#64748b' },
      { nombre: 'Hardware', color: '#4f46e5' },
      { nombre: 'Software', color: '#8b5cf6' },
      { nombre: 'Electrónica', color: '#ec4899' },
      { nombre: 'Servicios', color: '#0ea5e9' },
      { nombre: 'Alimentos', color: '#10b981' },
      { nombre: 'Bebidas', color: '#f59e0b' },
      { nombre: 'Limpieza', color: '#ef4444' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('posfactura_categorias', JSON.stringify(categorias));
  }, [categorias]);

  const ALMACENES = ['Principal', 'Secundario', 'Temporal', 'Externo'];
  const UNIDADES_MEDIDA = ['Unidad', 'Kilogramo', 'Litro', 'Metro', 'Caja', 'Paquete', 'Bulto'];
  const MOVIMIENTOS_INVENTARIO = ['Entrada', 'Salida', 'Ajuste', 'Devolución'];

  // Umbral de stock bajo (configurable)
  const LOW_STOCK_THRESHOLD = 5;

  const seccionesInventario = [
    { id: 'productos', label: 'Producto', icon: Package },
    { id: 'categoria', label: 'Categoría', icon: Tags },
    { id: 'movimiento', label: 'Movimiento de inventario', icon: ArrowLeftRight },
    { id: 'almacen', label: 'Almacén', icon: Warehouse },
    { id: 'conteo', label: 'Conteo Físico', icon: ClipboardList },
    { id: 'alerta', label: 'Alerta', icon: Bell },
    { id: 'lotes', label: 'Lotes Unidades', icon: Layers3 },
    { id: 'unidades', label: 'Unidades', icon: Ruler },
    { id: 'campos', label: 'Campos Personalizados', icon: Braces },
    { id: 'integraciones', label: 'Integraciones', icon: Plug },
  ];

  const filtrosProducto = [
    { id: 'todos', label: 'Todos' },
    { id: 'productos', label: 'Productos' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'activos', label: 'Activos' },
    { id: 'eliminados', label: 'Eliminados' },
  ];

  const formatPrice = (value) => {
    const price = Number(value);
    return Number.isFinite(price)
      ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';
  };

  const obtenerImagenProducto = (producto) => {
    const campoImagen = producto.camposPersonalizados?.find(campo => campo.nombre === 'imagenProducto');
    return producto.imagen || campoImagen?.valor || '';
  };

  const prepararCamposPersonalizados = (campos, imagen) => {
    const camposSinImagen = campos.filter(campo => campo.nombre !== 'imagenProducto');
    return imagen
      ? [...camposSinImagen, { id: 'imagenProducto', nombre: 'imagenProducto', valor: imagen }]
      : camposSinImagen;
  };

  const handleImagenUpload = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, imagen: reader.result || '' }));
    };
    reader.readAsDataURL(archivo);
  };

  const [formData, setFormData] = useState({
    nombre: '', 
    categoria: 'General', 
    precio: '', 
    stock: '', 
    codigo: '',
    almacen: 'Principal',
    pasillo: '',
    fila: '',
    unidadMedida: 'Unidad',
    movimientoInventario: 'Entrada',
    descripcion: '',
    imagen: '',
    camposPersonalizados: []
  });

  // --- 1. LÓGICA DE PERMISOS PARA INVENTARIO ---
  const permisoInventario = useMemo(() => {
    const savedRoles = localStorage.getItem('posfactura_roles_config');
    if (usuario?.rol === 'admin') return 'full';
    if (savedRoles && usuario) {
      const config = JSON.parse(savedRoles);
      return config[usuario.rol]?.modules?.inventario || 'none';
    }
    return 'none'; // Por defecto, acceso denegado si no hay configuración o usuario
  }, [usuario]);

  // --- FUNCIÓN DE EXPORTACIÓN (Actualizada) ---
  const exportarAExcel = () => {
    if (productosFiltrados.length === 0) return alert("No hay productos para exportar.");
    const encabezados = ["Código", "Producto", "Tipo", "Estado", "Categoría", "Almacén", "Pasillo", "Fila", "Precio", "Stock", "Unidad", "Movimiento", "Imagen", "Descripción"];
    const filas = productosFiltrados.map(p => [
      `"${p.codigo || ''}"`,
      `"${p.nombre}"`,
      `"${p.categoria === 'Servicios' ? 'Servicio' : 'Producto'}"`,
      `"${p.isActive === false ? 'Eliminado' : 'Activo'}"`,
      `"${p.categoria || 'General'}"`,
      `"${p.almacen || 'Principal'}"`,
      `"${p.pasillo || ''}"`,
      `"${p.fila || ''}"`,
      `"${p.precio}"`,
      `"${p.stock}"`,
      `"${p.unidadMedida || 'Unidad'}"`,
      `"${p.movimientoInventario || 'Entrada'}"`,
      `"${obtenerImagenProducto(p)}"`,
      `"${p.descripcion || ''}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + encabezados.join(",") + "\n" 
      + filas.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventario_Amplio_POSFactura_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (permisoInventario !== 'full') return;

    const dataProcesada = { 
      ...formData, 
      precio: parseFloat(formData.precio), 
      stock: parseInt(formData.stock),
      camposPersonalizados: prepararCamposPersonalizados(camposPersonalizados, formData.imagen)
    };
    delete dataProcesada.imagen;

    const guardado = isEditing
      ? await actualizarProducto(dataProcesada)
      : await agregarProducto(dataProcesada);

    if (guardado) cerrarModal();
  };

  const abrirEditar = (prod) => {
    if (permisoInventario !== 'full') return;
    const campos = prod.camposPersonalizados || [];
    setFormData({
      ...prod,
      imagen: obtenerImagenProducto(prod),
    });
    setCamposPersonalizados(campos.filter(campo => campo.nombre !== 'imagenProducto'));
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ 
      nombre: '', 
      categoria: 'General', 
      precio: '', 
      stock: '', 
      codigo: '',
      almacen: 'Principal',
      pasillo: '',
      fila: '',
      unidadMedida: 'Unidad',
      movimientoInventario: 'Entrada',
      descripcion: '',
      imagen: '',
      camposPersonalizados: []
    });
    setCamposPersonalizados([]);
  };

  // Funciones para campos personalizados
  const agregarCampoPersonalizado = () => {
    if (nuevoCampo.nombre.trim()) {
      setCamposPersonalizados([...camposPersonalizados, { ...nuevoCampo, id: Date.now() }]);
      setNuevoCampo({ nombre: '', valor: '' });
    }
  };

  const eliminarCampoPersonalizado = (id) => {
    setCamposPersonalizados(camposPersonalizados.filter(campo => campo.id !== id));
  };

  const almacenesDisponibles = useMemo(() => {
    const nombres = new Set([...ALMACENES, ...productos.map(p => p.almacen || 'Principal')]);
    return Array.from(nombres).sort((a, b) => a.localeCompare(b));
  }, [productos]);

  const ubicacionesDisponibles = useMemo(() => {
    const ubicaciones = productos
      .filter(p => almacenFiltro === 'todos' || (p.almacen || 'Principal') === almacenFiltro)
      .map(p => {
        const pasillo = p.pasillo || 'Sin pasillo';
        const fila = p.fila || 'Sin fila';
        return `${pasillo} / ${fila}`;
      });

    return Array.from(new Set(ubicaciones)).sort((a, b) => a.localeCompare(b));
  }, [productos, almacenFiltro]);

  const productosFiltrados = useMemo(() => productos.filter(p => {
    // Usamos ?. y || "" para que si el nombre viene null de la DB, no rompa el sistema
    const nombre = p.nombre?.toLowerCase() || "";
    const codigo = p.codigo?.toLowerCase() || "";
    const categoria = p.categoria?.toLowerCase() || "";
    const almacen = p.almacen || 'Principal';
    const almacenBusqueda = almacen.toLowerCase();
    const pasillo = p.pasillo || 'Sin pasillo';
    const fila = p.fila || 'Sin fila';
    const pasilloBusqueda = pasillo.toLowerCase();
    const filaBusqueda = fila.toLowerCase();
    const descripcion = p.descripcion?.toLowerCase() || "";
    const query = searchTerm.toLowerCase();
    const coincideBusqueda = nombre.includes(query) || 
           codigo.includes(query) || 
           categoria.includes(query) || 
           almacenBusqueda.includes(query) || 
           pasilloBusqueda.includes(query) || 
           filaBusqueda.includes(query) || 
           descripcion.includes(query);
    const coincideAlmacen = almacenFiltro === 'todos' || almacen === almacenFiltro;
    const coincideUbicacion = ubicacionFiltro === 'todas' || `${pasillo} / ${fila}` === ubicacionFiltro;
    const esServicio = p.categoria === 'Servicios';
    const estaActivo = p.isActive !== false;
    const coincideTipoProducto =
      filtroProducto === 'todos' ||
      (filtroProducto === 'productos' && !esServicio) ||
      (filtroProducto === 'servicios' && esServicio) ||
      (filtroProducto === 'activos' && estaActivo) ||
      (filtroProducto === 'eliminados' && !estaActivo);
    
    return coincideBusqueda && coincideAlmacen && coincideUbicacion && coincideTipoProducto;
  }), [productos, searchTerm, almacenFiltro, ubicacionFiltro, filtroProducto]);

  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroProducto('todos');
    setAlmacenFiltro('todos');
    setUbicacionFiltro('todas');
  };

  // Si por alguna razón llega aquí y no tiene permiso ni de ver, mostramos aviso
  if (permisoInventario === 'none') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200">
          <Lock size={60} className="text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 uppercase italic">Acceso Restringido</h2>
          <p className="text-slate-500 font-medium mt-2">No tienes permisos para gestionar el inventario.</p>
        </div>
      </div>
    );
  }

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

        <div className="p-3 space-y-3" style={{ display: seccionActiva === 'unidades' ? 'none' : undefined }}>
          {seccionActiva === 'productos' ? (
            <>
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {filtrosProducto.map(filtro => (
                    <button
                      key={filtro.id}
                      type="button"
                      onClick={() => setFiltroProducto(filtro.id)}
                      className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all ${
                        filtroProducto === filtro.id
                          ? 'bg-brand text-white border-brand shadow-sm'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800'
                      }`}
                    >
                      {filtro.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
                    <button 
                      onClick={() => setVista('grid')}
                      className={`p-1.5 rounded-md transition-all ${vista === 'grid' ? 'bg-white text-brand shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Vista de tarjetas"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button 
                      onClick={() => setVista('lista')}
                      className={`p-1.5 rounded-md transition-all ${vista === 'lista' ? 'bg-white text-brand shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Vista de lista"
                    >
                      <List size={16} />
                    </button>
                  </div>

                  {permisoInventario === 'full' && (
                    <button 
                      onClick={() => mostrarToast("Módulo de importación próximamente (Excel/CSV)", "warning")}
                      title="Importar productos"
                      className="h-9 w-9 flex items-center justify-center bg-amber-500 text-white rounded-lg font-black shadow-sm hover:bg-amber-600 transition-all active:scale-95"
                    >
                      <Upload size={16} />
                    </button>
                  )}

                  <button 
                    onClick={exportarAExcel}
                    title="Exportar productos filtrados"
                    className="h-9 w-9 flex items-center justify-center bg-emerald-500 text-white rounded-lg font-black shadow-sm hover:bg-emerald-600 transition-all active:scale-95"
                  >
                    <FileText size={16} />
                  </button>

                  {permisoInventario === 'full' && (
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      title="Nuevo producto"
                      className="h-9 w-9 flex items-center justify-center bg-brand text-white rounded-lg font-black shadow-sm hover:bg-indigo-600 transition-all active:scale-95"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre, código, categoría, almacén, pasillo..." 
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 outline-none focus:border-brand transition-all font-bold text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  value={almacenFiltro}
                  onChange={(e) => {
                    setAlmacenFiltro(e.target.value);
                    setUbicacionFiltro('todas');
                  }}
                  className="min-w-44 h-9 px-3 rounded-lg border border-slate-200 outline-none focus:border-brand transition-all font-black text-[10px] uppercase text-slate-600 bg-white"
                >
                  <option value="todos">Todos los almacenes</option>
                  {almacenesDisponibles.map(almacen => (
                    <option key={almacen} value={almacen}>{almacen}</option>
                  ))}
                </select>

                <select
                  value={ubicacionFiltro}
                  onChange={(e) => setUbicacionFiltro(e.target.value)}
                  className="min-w-44 h-9 px-3 rounded-lg border border-slate-200 outline-none focus:border-brand transition-all font-black text-[10px] uppercase text-slate-600 bg-white"
                >
                  <option value="todas">Todas las ubicaciones</option>
                  {ubicacionesDisponibles.map(ubicacion => (
                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="h-9 px-3 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <X size={12} /> Limpiar
                </button>

                {permisoInventario === 'view' && (
                  <div className="h-9 flex items-center justify-center gap-1.5 text-amber-500 bg-amber-50 px-3 rounded-lg border border-amber-100 italic font-black text-[9px] uppercase">
                    <Lock size={12} /> Solo Lectura
                  </div>
                )}
              </div>
            </>
          ) : seccionActiva === 'categoria' ? (
            <CategoriasSection categorias={categorias} setCategorias={setCategorias} mostrarToast={mostrarToast} />
          ) : seccionActiva === 'movimiento' ? (
            <MovimientosSection />
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
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                <Layers3 size={18} />
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Lotes</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gestión y trazabilidad de lotes de productos</p>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {['Todos', 'Activos', 'Cuarentena', 'Por vencer', 'Vencidos', 'Retirados'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFiltroLote(f)}
                    className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all ${
                      filtroLote === f
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input 
                  type="text" 
                  placeholder="Buscar por número de lote..." 
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 outline-none focus:border-brand transition-all font-bold text-xs"
                  value={searchTermLote}
                  onChange={(e) => setSearchTermLote(e.target.value)}
                />
              </div>
            </div>

            <div className="py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Layers3 size={40} className="mx-auto mb-4 text-slate-200" />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No se encontraron lotes registrados</p>
            </div>
          </div>
          ) : null}
        </div>
      </section>

      {seccionActiva === 'unidades' && <UnidadesSection />}

      {seccionActiva === 'campos' && <CamposPersonalizadosSection />}

      {seccionActiva === 'integraciones' && <IntegracionesSection />}

      {/* Listado de Productos (Solo visible en la sección de productos) */}
      {seccionActiva === 'productos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {errorConexion && (
            <div className="m-4 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-600">
              <div className="flex items-center gap-2 text-sm font-black">
                <AlertTriangle size={18} />
                {errorConexion}
              </div>
              <button
                onClick={recargarInventario}
                className="rounded-lg bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-red-500 border border-red-100 hover:bg-red-100 transition-all"
              >
                Reintentar
              </button>
            </div>
          )}

          {loading && (
            <div className="px-6 py-12 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
              Cargando inventario...
            </div>
          )}

          {!loading && !errorConexion && productosFiltrados.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
              No hay productos para mostrar
            </div>
          )}

          {!loading && productosFiltrados.length > 0 && (
            vista === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3 p-3">
              {productosFiltrados.map(prod => {
                const imagenProducto = obtenerImagenProducto(prod);
                const stockActual = Number(prod.stock) || 0;
                const bajoStock = stockActual <= LOW_STOCK_THRESHOLD;
                const esServicio = prod.categoria === 'Servicios';
                const estaActivo = prod.isActive !== false;
                const colorCat = categorias.find(c => c.nombre === prod.categoria)?.color || '#e2e8f0';

                return (
                  <article
                    key={prod.id}
                    className={`group rounded-xl border bg-white shadow-sm overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md relative ${
                      estaActivo ? 'border-slate-200' : 'border-red-100 bg-red-50/20'
                    }`}
                  >
                    {/* Indicador lateral de categoría */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 z-10" style={{ backgroundColor: colorCat }}></div>
                    
                    <div className="relative aspect-[2.5/1] bg-slate-50 overflow-hidden border-b border-slate-100">
                      {imagenProducto ? (
                        <img
                          src={imagenProducto}
                          alt={prod.nombre}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-200 gap-2">
                          <Package size={20} strokeWidth={1.5} />
                          <span className="text-[7px] font-black uppercase tracking-[0.2em]">S/I</span>
                        </div>
                      )}

                      <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm ${
                          esServicio ? 'bg-sky-500 text-white' : 'bg-slate-900 text-white'
                        }`}>
                          {esServicio ? 'Servicio' : 'Producto'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm ${
                          estaActivo ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {estaActivo ? 'Activo' : 'Eliminado'}
                        </span>
                      </div>

                      {bajoStock && !esServicio && (
                        <div className="absolute right-2 top-2 h-7 w-7 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-sm">
                          <AlertTriangle size={13} />
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-2.5">
                      <div className="min-h-12">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-tight truncate">{prod.nombre}</h3>
                            <p className="text-[9px] text-slate-400 font-bold tracking-tight italic">#{prod.codigo || 'S/C'}</p>
                          </div>
                          <p className="font-black text-slate-900 italic text-xs whitespace-nowrap">RD$ {formatPrice(prod.precio)}</p>
                        </div>
                        {prod.descripcion && (
                          <p className="mt-1 text-[10px] text-slate-400 font-medium line-clamp-1">{prod.descripcion}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className={`rounded-lg border px-2.5 py-1.5 ${
                          bajoStock && !esServicio ? 'bg-red-50 border-red-100 text-red-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}>
                          <p className="text-[8px] font-black uppercase tracking-wider opacity-70">Existencia</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <BarChart3 size={12} />
                            <span className="text-base font-black">{stockActual}</span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-600">
                          <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Unidad</p>
                          <p className="mt-0.5 text-[10px] font-black uppercase truncate">{prod.unidadMedida || 'Unidad'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div className="rounded-lg border border-slate-100 px-2.5 py-1.5">
                          <p className="font-black uppercase tracking-wider text-slate-400">Categoría</p>
                          <p className="mt-0.5 font-black text-slate-700 uppercase truncate">{prod.categoria || 'General'}</p>
                        </div>
                        <div className="rounded-lg border border-slate-100 px-2.5 py-1.5">
                          <p className="font-black uppercase tracking-wider text-slate-400">Movimiento</p>
                          <p className="mt-0.5 font-black text-slate-700 uppercase truncate">{prod.movimientoInventario || 'Entrada'}</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-100 px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <Warehouse size={11} className="text-slate-400" />
                          <span className="text-[9px] font-black text-slate-600 uppercase truncate">{prod.almacen || 'Principal'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin size={11} className="text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase truncate">
                            Pasillo {prod.pasillo || '?'} · Fila {prod.fila || '?'}
                          </span>
                        </div>
                      </div>

                      {permisoInventario === 'full' && (
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button 
                            onClick={() => abrirEditar(prod)} 
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-all"
                          >
                            <Edit3 size={12}/> Editar
                          </button>
                          {estaActivo ? (
                            <button 
                              onClick={() => { if(window.confirm('¿Mover producto a eliminados?')) actualizarProducto({ ...prod, isActive: false }) }} 
                              className="h-8 w-8 flex items-center justify-center text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                            >
                              <Trash2 size={13}/>
                            </button>
                          ) : (
                            <button 
                              onClick={() => actualizarProducto({ ...prod, isActive: true })} 
                              className="px-3 h-8 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-all"
                            >
                              Activar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-black tracking-widest italic">
                    <tr>
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-6 py-4">Categoría / Almacén</th>
                      <th className="px-6 py-4 text-center">Stock</th>
                      <th className="px-6 py-4 text-right">Precio</th>
                      {permisoInventario === 'full' && <th className="px-6 py-4 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {productosFiltrados.map(prod => {
                      const stockActual = Number(prod.stock) || 0;
                      const bajoStock = stockActual <= LOW_STOCK_THRESHOLD;
                      const esServicio = prod.categoria === 'Servicios';
                      const estaActivo = prod.isActive !== false;
                      const colorCat = categorias.find(c => c.nombre === prod.categoria)?.color || '#e2e8f0';

                      return (
                        <tr key={prod.id} className={`hover:bg-slate-50/50 transition-colors ${!estaActivo ? 'bg-red-50/20' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                {obtenerImagenProducto(prod) ? (
                                  <img src={obtenerImagenProducto(prod)} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-slate-300">
                                    <Package size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-slate-800 uppercase text-xs truncate">{prod.nombre}</p>
                                <p className="text-[9px] text-slate-400 font-bold tracking-tight italic">#{prod.codigo || 'S/C'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorCat }}></div>
                                {prod.categoria}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                                <Warehouse size={10} /> {prod.almacen}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              bajoStock && !esServicio ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {stockActual} {prod.unidadMedida}
                              {bajoStock && !esServicio && <AlertTriangle size={10} />}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-black text-slate-900 italic text-xs">RD$ {formatPrice(prod.precio)}</p>
                          </td>
                          {permisoInventario === 'full' && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button 
                                  onClick={() => abrirEditar(prod)} 
                                  className="p-2 text-brand hover:bg-indigo-50 rounded-lg transition-all"
                                >
                                  <Edit3 size={16} />
                                </button>
                                {estaActivo ? (
                                  <button 
                                    onClick={() => { if (window.confirm('¿Eliminar?')) actualizarProducto({ ...prod, isActive: false }) }} 
                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                ) : (
                                  <button onClick={() => actualizarProducto({ ...prod, isActive: true })} className="px-3 py-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all">Activar</button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-10 right-10 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[200] border animate-in slide-in-from-right-5 ${
          toast.tipo === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 
          toast.tipo === 'warning' ? 'bg-amber-500 text-white border-amber-400' : 'bg-slate-900 text-white border-slate-700'
        }`}>
          {toast.tipo === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="font-black text-[10px] uppercase tracking-widest">{toast.mensaje}</span>
        </div>
      )}

      {/* Modal Expandido */}
      {isModalOpen && permisoInventario === 'full' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">
                {isEditing ? 'Actualizar Producto' : 'Nuevo Registro de Inventario'}
              </h2>
              <button onClick={cerrarModal} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 transition-all shadow-sm"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Package size={16} /> Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Nombre del Producto *</label>
                    <input required className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-slate-700 text-sm"
                      value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Tipo</label>
                    <select
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all bg-white font-bold text-slate-700 cursor-pointer text-sm"
                      value={formData.categoria === 'Servicios' ? 'servicio' : 'producto'}
                      onChange={(e) => setFormData({
                        ...formData,
                        categoria: e.target.value === 'servicio' ? 'Servicios' : 'General',
                        stock: e.target.value === 'servicio' ? '0' : formData.stock,
                      })}
                    >
                      <option value="producto">Producto</option>
                      <option value="servicio">Servicio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Código / SKU</label>
                    <input className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-slate-700 text-sm"
                      value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Imagen</label>
                    <div className="grid grid-cols-1 md:grid-cols-[88px_1fr] gap-3 items-center">
                      <div className="h-20 w-20 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {formData.imagen ? (
                          <img src={formData.imagen} alt="Vista previa" className="h-full w-full object-cover" />
                        ) : (
                          <Image size={22} className="text-slate-300" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-slate-700 text-sm"
                          placeholder="Pegar URL de imagen"
                          value={formData.imagen}
                          onChange={(e) => setFormData({...formData, imagen: e.target.value})}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImagenUpload}
                          className="block w-full text-xs font-bold text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white hover:file:bg-brand"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Categoría</label>
                    <select className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all bg-white font-bold text-slate-700 cursor-pointer text-sm"
                      value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    >
                      {categorias.map(cat => (
                        <option key={cat.nombre} value={cat.nombre}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ubicación en Almacén */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Warehouse size={16} /> Ubicación en Almacén
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Almacén</label>
                    <select className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all bg-white font-bold text-slate-700 cursor-pointer text-sm"
                      value={formData.almacen} onChange={(e) => setFormData({...formData, almacen: e.target.value})}>
                      <option value="Principal">Principal</option>
                      <option value="Secundario">Secundario</option>
                      <option value="Temporal">Temporal</option>
                      <option value="Externo">Externo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Pasillo</label>
                    <input className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-slate-700 text-sm"
                      placeholder="Ej: 1, 2, A, B" value={formData.pasillo} onChange={(e) => setFormData({...formData, pasillo: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Fila</label>
                    <input className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-slate-700 text-sm"
                      placeholder="Ej: A, B, 1, 2" value={formData.fila} onChange={(e) => setFormData({...formData, fila: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Inventario y Precios */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={16} /> Inventario y Precios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-[0.2em] ml-1">Precio (RD$) *</label>
                    <input type="number" step="0.01" required className="w-full px-5 py-3 rounded-2xl border border-indigo-100 outline-none focus:border-brand shadow-sm transition-all font-black text-slate-800 text-sm"
                      value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-[0.2em] ml-1">Stock *</label>
                    <input type="number" required className="w-full px-5 py-3 rounded-2xl border border-indigo-100 outline-none focus:border-brand shadow-sm transition-all font-black text-slate-800 text-sm"
                      value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Unidad de Medida</label>
                    <select className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all bg-white font-bold text-slate-700 cursor-pointer text-sm"
                      value={formData.unidadMedida} onChange={(e) => setFormData({...formData, unidadMedida: e.target.value})}>
                      {unidadesMedida.filter(u => u.activo).map(u => (
                        <option key={u.id} value={u.nombre}>{u.nombre} ({u.codigo})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Movimiento</label>
                    <select className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all bg-white font-bold text-slate-700 cursor-pointer text-sm"
                      value={formData.movimientoInventario} onChange={(e) => setFormData({...formData, movimientoInventario: e.target.value})}>
                      <option value="Entrada">Entrada</option>
                      <option value="Salida">Salida</option>
                      <option value="Ajuste">Ajuste</option>
                      <option value="Devolución">Devolución</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} /> Descripción
                </h3>
                <div>
                  <textarea 
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-slate-700 text-sm resize-none"
                    rows="3"
                    placeholder="Descripción detallada del producto..."
                    value={formData.descripcion} 
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  />
                </div>
              </div>

              {/* Campos Personalizados */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Settings size={16} /> Campos Personalizados
                </h3>
                
                <p className="text-[10px] text-slate-500">Define los atributos que tus productos y servicios necesitan: VIN, año modelo, talla, principio activo, lo que sea relevante para los negocios.</p>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowNuevoCampo(prev => !prev)} className="px-4 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all font-bold text-sm flex items-center gap-2">
                    <PlusCircle size={16} /> Nuevo Campo
                  </button>
                </div>

                {showNuevoCampo && (
                  <div className="flex gap-3 items-end mt-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Nombre del Campo</label>
                      <input 
                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-slate-700 text-sm"
                        placeholder="Ej: Marca, Modelo, Color..."
                        value={nuevoCampo.nombre}
                        onChange={(e) => setNuevoCampo({...nuevoCampo, nombre: e.target.value})}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Valor</label>
                      <input 
                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-slate-700 text-sm"
                        placeholder="Valor del campo..."
                        value={nuevoCampo.valor}
                        onChange={(e) => setNuevoCampo({...nuevoCampo, valor: e.target.value})}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => { agregarCampoPersonalizado(); setShowNuevoCampo(false); }}
                      className="px-4 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all font-bold text-sm flex items-center gap-2"
                    >
                      <PlusCircle size={16} /> Agregar
                    </button>
                    <button type="button" onClick={() => setShowNuevoCampo(false)} className="px-4 py-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all font-bold text-sm">Cancelar</button>
                  </div>
                )}

                {/* Lista de campos personalizados */}
                {camposPersonalizados.length > 0 && (
                  <div className="space-y-2">
                    {camposPersonalizados.map(campo => (
                      <div key={campo.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex-1">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{campo.nombre}:</span>
                          <span className="ml-2 font-bold text-slate-700">{campo.valor}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => eliminarCampoPersonalizado(campo.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <MinusCircle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-brand transition-all mt-6 uppercase tracking-[0.2em] text-xs">
                {isEditing ? 'Confirmar Cambios' : 'Registrar en Inventario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
