import React, { useState, useMemo } from 'react';
import {
  Package, Search, Edit3, Trash2, Plus, X, 
  FileText, BarChart3, AlertTriangle, Lock,
  Warehouse, MapPin, Settings,
  PlusCircle, MinusCircle
} from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useAuth } from '../context/AuthContext';

const Inventario = () => {
  const { productos, agregarProducto, actualizarProducto, eliminarProducto } = useInventario();
  const { usuario } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [camposPersonalizados, setCamposPersonalizados] = useState([]);
  const [nuevoCampo, setNuevoCampo] = useState({ nombre: '', valor: '' });
  const [formErrors, setFormErrors] = useState({}); // Nuevo estado para errores de formulario

  // Constantes para opciones de select (mejora de mantenibilidad)
  const CATEGORIAS = ['General', 'Hardware', 'Software', 'Electrónica', 'Servicios', 'Alimentos', 'Bebidas', 'Limpieza'];
  const ALMACENES = ['Principal', 'Secundario', 'Temporal', 'Externo'];
  const UNIDADES_MEDIDA = ['Unidad', 'Kilogramo', 'Litro', 'Metro', 'Caja', 'Paquete', 'Bulto'];
  const MOVIMIENTOS_INVENTARIO = ['Entrada', 'Salida', 'Ajuste', 'Devolución'];

  // Umbral de stock bajo (configurable)
  const LOW_STOCK_THRESHOLD = 5;

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

  // --- FUNCIÓN DE EXPORTACIÓN (Actualizada) ---
  const exportarAExcel = () => {
    if (productos.length === 0) return alert("No hay productos para exportar.");
    const encabezados = ["Código", "Producto", "Categoría", "Almacén", "Pasillo", "Fila", "Precio", "Stock", "Unidad", "Movimiento", "Descripción"];
    const filas = productos.map(p => [
      `"${p.codigo || ''}"`,
      `"${p.nombre}"`,
      `"${p.categoria || 'General'}"`,
      `"${p.almacen || 'Principal'}"`,
      `"${p.pasillo || ''}"`,
      `"${p.fila || ''}"`,
      `"${p.precio}"`,
      `"${p.stock}"`,
      `"${p.unidadMedida || 'Unidad'}"`,
      `"${p.movimientoInventario || 'Entrada'}"`,
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
      camposPersonalizados: camposPersonalizados
    };

    const guardado = isEditing
      ? await actualizarProducto(dataProcesada)
      : await agregarProducto(dataProcesada);

    if (guardado) cerrarModal();
  };

  const abrirEditar = (prod) => {
    if (permisoInventario !== 'full') return;
    setFormData(prod);
    setCamposPersonalizados(prod.camposPersonalizados || []);
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

const productosFiltrados = productos.filter(p => {
  // Usamos ?. y || "" para que si el nombre viene null de la DB, no rompa el sistema
  const nombre = p.nombre?.toLowerCase() || "";
  const codigo = p.codigo?.toLowerCase() || "";
  const categoria = p.categoria?.toLowerCase() || "";
  const almacen = p.almacen?.toLowerCase() || "";
  const pasillo = p.pasillo?.toLowerCase() || "";
  const fila = p.fila?.toLowerCase() || "";
  const descripcion = p.descripcion?.toLowerCase() || "";
  const query = searchTerm.toLowerCase();
  
  return nombre.includes(query) || 
         codigo.includes(query) || 
         categoria.includes(query) || 
         almacen.includes(query) || 
         pasillo.includes(query) || 
         fila.includes(query) || 
         descripcion.includes(query);
});

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Inventario Avanzado</h1>
          <p className="text-slate-500 font-medium">Gestión completa de stock con ubicación y personalización.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={exportarAExcel}
            className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            <FileText size={18} /> <span className="hidden md:inline">Exportar</span>
          </button>
          
          {/* SOLO MOSTRAR SI TIENE CONTROL TOTAL */}
          {permisoInventario === 'full' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-brand text-white px-5 py-3 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              <Plus size={18} /> <span className="hidden md:inline">Nuevo Producto</span>
            </button>
          )}
        </div>
      </header>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, código, categoría, almacén, pasillo..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {permisoInventario === 'view' && (
           <div className="hidden md:flex items-center gap-2 text-amber-500 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 italic font-black text-[10px] uppercase">
             <Lock size={14} /> Modo Solo Lectura
           </div>
        )}
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-black tracking-[0.2em]">
            <tr>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Ubicación</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Unidad</th>
              {permisoInventario === 'full' && <th className="px-6 py-4 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {productosFiltrados.map(prod => (
              <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-400 rounded-lg group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                      <Package size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-700 uppercase text-xs tracking-tight">{prod.nombre}</span>
                      <span className="text-[9px] text-slate-400 font-bold tracking-tighter italic">#{prod.codigo || 'S/C'}</span>
                      {prod.descripcion && (
                        <span className="text-[8px] text-slate-300 font-medium">{prod.descripcion.substring(0, 30)}...</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Warehouse size={12} className="text-slate-400" />
                      <span className="text-[9px] font-black text-slate-500 uppercase">{prod.almacen || 'Principal'}</span>
                    </div>
                    {(prod.pasillo || prod.fila) && (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400">
                          P{prod.pasillo || '?'} - F{prod.fila || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-white text-slate-500 rounded-md text-[9px] font-black border border-slate-200 uppercase tracking-tighter shadow-sm">
                    {prod.categoria}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-slate-800 italic">
                  RD$ {(prod.precio || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 font-black text-xs ${prod.stock <= 5 ? 'text-red-500 bg-red-50 px-3 py-1 rounded-lg border border-red-100 w-fit' : 'text-emerald-600'}`}>
                    <BarChart3 size={14} />
                    {prod.stock} {prod.unidadMedida || 'UDS'}
                    {prod.stock <= 5 && <AlertTriangle size={12} className="animate-pulse" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase">
                    {prod.unidadMedida || 'Unidad'}
                  </span>
                </td>
                
                {/* ACCIONES: Solo si es FULL */}
                {permisoInventario === 'full' && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => abrirEditar(prod)} 
                        className="p-2 text-slate-400 hover:text-brand hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
                      >
                        <Edit3 size={18}/>
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('¿Eliminar producto?')) eliminarProducto(prod.id) }} 
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Código / SKU</label>
                    <input className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all font-bold text-slate-700 text-sm"
                      value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-1">Categoría</label>
                    <select className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-brand shadow-sm transition-all bg-white font-bold text-slate-700 cursor-pointer text-sm"
                      value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})}>
                      <option value="General">General</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Software">Software</option>
                      <option value="Electrónica">Electrónica</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Alimentos">Alimentos</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Limpieza">Limpieza</option>
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
                      <option value="Unidad">Unidad</option>
                      <option value="Kilogramo">Kilogramo</option>
                      <option value="Litro">Litro</option>
                      <option value="Metro">Metro</option>
                      <option value="Caja">Caja</option>
                      <option value="Paquete">Paquete</option>
                      <option value="Bulto">Bulto</option>
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
                
                {/* Agregar nuevo campo */}
                <div className="flex gap-3 items-end">
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
                    onClick={agregarCampoPersonalizado}
                    className="px-4 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all font-bold text-sm flex items-center gap-2"
                  >
                    <PlusCircle size={16} />
                  </button>
                </div>

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
