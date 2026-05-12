import React, { useState, useMemo, useEffect } from 'react';
import {
  Package, Search, Edit3, Trash2, Plus, X, 
  FileText, BarChart3, AlertTriangle, 
  Warehouse, MapPin, Settings,
  PlusCircle, MinusCircle, LayoutGrid, List,
  Image, Upload, CheckCircle
} from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';
import { useAuth } from '../../context/AuthContext';

const ProductosSection = ({ mostrarToast }) => {
  const {
    productos, 
    loading,
    errorConexion,
    agregarProducto,
    actualizarProducto,
    recargarInventario,
    categorias,
    unidadesMedida
  } = useInventario();
  const { usuario } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [vista, setVista] = useState(() => localStorage.getItem('posfactura_inventario_vista') || 'grid');
  const [filtroProducto, setFiltroProducto] = useState('todos');
  const [searchTerm, setSearchTerm] = useState("");
  const [almacenFiltro, setAlmacenFiltro] = useState('todos');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('todas');
  const [camposPersonalizados, setCamposPersonalizados] = useState([]);
  const [nuevoCampo, setNuevoCampo] = useState({ nombre: '', valor: '' });
  const [showNuevoCampo, setShowNuevoCampo] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '', categoria: 'General', precio: '', stock: '', codigo: '',
    almacen: 'Principal', pasillo: '', fila: '', unidadMedida: 'Unidad',
    movimientoInventario: 'Entrada', descripcion: '', imagen: '', camposPersonalizados: []
  });

  useEffect(() => {
    localStorage.setItem('posfactura_inventario_vista', vista);
  }, [vista]);

  const LOW_STOCK_THRESHOLD = 5;

  const permisoInventario = useMemo(() => {
    if (usuario?.rol === 'admin') return 'full';
    const savedRoles = localStorage.getItem('posfactura_roles_config');
    if (savedRoles && usuario) {
      const config = JSON.parse(savedRoles);
      return config[usuario.rol]?.modules?.inventario || 'none';
    }
    return 'none';
  }, [usuario]);

  const formatPrice = (value) => {
    const price = Number(value);
    return Number.isFinite(price) ? price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00';
  };

  const obtenerImagenProducto = (producto) => {
    const campoImagen = producto.camposPersonalizados?.find(campo => campo.nombre === 'imagenProducto');
    return producto.imagen || campoImagen?.valor || '';
  };

  const handleImagenUpload = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onload = () => setFormData(prev => ({ ...prev, imagen: reader.result || '' }));
    reader.readAsDataURL(archivo);
  };

  const exportarAExcel = () => {
    if (productosFiltrados.length === 0) return alert("No hay productos.");
    const encabezados = ["Código", "Producto", "Tipo", "Precio", "Stock", "Almacén"];
    const filas = productosFiltrados.map(p => [
      `"${p.codigo || ''}"`, `"${p.nombre}"`, `"${p.categoria}"`, `"${p.precio}"`, `"${p.stock}"`, `"${p.almacen || 'Principal'}"`
    ].join(","));
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encabezados.join(",") + "\n" + filas.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Inventario_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const dataProcesada = { 
      ...formData, 
      precio: parseFloat(formData.precio), 
      stock: parseInt(formData.stock),
      camposPersonalizados: formData.imagen 
        ? [...camposPersonalizados, { id: 'img', nombre: 'imagenProducto', valor: formData.imagen }] 
        : camposPersonalizados
    };
    const guardado = isEditing ? await actualizarProducto(dataProcesada) : await agregarProducto(dataProcesada);
    if (guardado) cerrarModal();
  };

  const abrirEditar = (prod) => {
    setFormData({ ...prod, imagen: obtenerImagenProducto(prod) });
    setCamposPersonalizados((prod.camposPersonalizados || []).filter(c => c.nombre !== 'imagenProducto'));
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ nombre: '', categoria: 'General', precio: '', stock: '', codigo: '', almacen: 'Principal', pasillo: '', fila: '', unidadMedida: 'Unidad', movimientoInventario: 'Entrada', descripcion: '', imagen: '', camposPersonalizados: [] });
    setCamposPersonalizados([]);
  };

  const productosFiltrados = useMemo(() => productos.filter(p => {
    const query = searchTerm.toLowerCase();
    const coincideBusqueda = (p.nombre?.toLowerCase() || "").includes(query) || (p.codigo?.toLowerCase() || "").includes(query);
    const coincideAlmacen = almacenFiltro === 'todos' || (p.almacen || 'Principal') === almacenFiltro;
    const estaActivo = p.isActive !== false;
    const coincideTipo = filtroProducto === 'todos' || (filtroProducto === 'productos' && p.categoria !== 'Servicios') || (filtroProducto === 'servicios' && p.categoria === 'Servicios') || (filtroProducto === 'activos' && estaActivo) || (filtroProducto === 'eliminados' && !estaActivo);
    return coincideBusqueda && coincideAlmacen && coincideTipo;
  }), [productos, searchTerm, almacenFiltro, filtroProducto]);

  return (
    <div className="space-y-4">
      {/* Toolbar de Productos */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {['todos', 'productos', 'servicios', 'activos', 'eliminados'].map(f => (
            <button key={f} onClick={() => setFiltroProducto(f)} className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all ${filtroProducto === f ? 'bg-brand text-white border-brand shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setVista('grid')} className={`p-1.5 rounded-md ${vista === 'grid' ? 'bg-white text-brand shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={16}/></button>
            <button onClick={() => setVista('lista')} className={`p-1.5 rounded-md ${vista === 'lista' ? 'bg-white text-brand shadow-sm' : 'text-slate-400'}`}><List size={16}/></button>
          </div>
          <button onClick={exportarAExcel} className="h-9 w-9 flex items-center justify-center bg-emerald-500 text-white rounded-lg shadow-sm hover:bg-emerald-600"><FileText size={16}/></button>
          {permisoInventario === 'full' && (
            <button onClick={() => setIsModalOpen(true)} className="h-9 w-9 flex items-center justify-center bg-brand text-white rounded-lg shadow-sm hover:bg-indigo-600"><Plus size={18}/></button>
          )}
        </div>
      </div>

      {/* Buscador y Almacén */}
      <div className="flex flex-col xl:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input type="text" placeholder="Buscar por nombre o código..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 outline-none text-xs font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
        <select value={almacenFiltro} onChange={(e) => setAlmacenFiltro(e.target.value)} className="min-w-44 h-9 px-3 rounded-lg border border-slate-200 text-[10px] font-black uppercase text-slate-600 bg-white">
          <option value="todos">Todos los almacenes</option>
          {['Principal', 'Secundario', 'Temporal', 'Externo'].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Lista de Productos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="py-20 text-center text-xs font-black uppercase text-slate-400">Cargando...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-20 text-center text-xs font-black uppercase text-slate-400">No hay productos</div>
        ) : vista === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3 p-3">
            {productosFiltrados.map(prod => (
              <article key={prod.id} className="group rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:-translate-y-0.5 relative">
                <div className="aspect-[2.5/1] bg-slate-50 relative border-b border-slate-100">
                  {obtenerImagenProducto(prod) ? <img src={obtenerImagenProducto(prod)} alt={prod.nombre} className="h-full w-full object-cover"/> : <div className="h-full w-full flex items-center justify-center text-slate-200"><Package size={20}/></div>}
                  <div className="absolute left-2 top-2 flex gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-white ${prod.categoria === 'Servicios' ? 'bg-sky-500' : 'bg-slate-900'}`}>{prod.categoria === 'Servicios' ? 'Servicio' : 'Producto'}</span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-black text-slate-800 uppercase text-xs truncate">{prod.nombre}</h3>
                    <p className="font-black text-slate-900 text-xs italic whitespace-nowrap">RD$ {formatPrice(prod.precio)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`rounded-lg p-1.5 border ${prod.stock <= LOW_STOCK_THRESHOLD ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <p className="text-[8px] font-black uppercase opacity-70">Stock</p>
                      <span className="text-sm font-black">{prod.stock}</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Almacén</p>
                      <p className="text-[9px] font-black truncate">{prod.almacen || 'Principal'}</p>
                    </div>
                  </div>
                  {permisoInventario === 'full' && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => abrirEditar(prod)} className="flex-1 py-1.5 text-[9px] font-black uppercase bg-indigo-50 text-brand rounded-lg border border-indigo-100">Editar</button>
                      <button onClick={() => {if(window.confirm('¿Eliminar?')) actualizarProducto({...prod, isActive:false})}} className="p-1.5 text-red-500 bg-red-50 rounded-lg"><Trash2 size={13}/></button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[9px] font-black uppercase text-slate-400">
              <tr><th className="px-6 py-4">Producto</th><th className="px-6 py-4">Almacén</th><th className="px-6 py-4 text-center">Stock</th><th className="px-6 py-4 text-right">Precio</th><th className="px-6 py-4"></th></tr>
            </thead>
            <tbody className="divide-y text-sm">
              {productosFiltrados.map(prod => (
                <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-black text-slate-700 uppercase text-xs">{prod.nombre}</td>
                  <td className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">{prod.almacen || 'Principal'}</td>
                  <td className="px-6 py-3 text-center font-black">{prod.stock}</td>
                  <td className="px-6 py-3 text-right font-black italic">RD$ {formatPrice(prod.precio)}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => abrirEditar(prod)} className="p-1.5 text-brand hover:bg-indigo-50 rounded-lg"><Edit3 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase italic">{isEditing ? 'Actualizar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={cerrarModal} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white shadow-sm"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre *</label>
                  <input required className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Código / SKU</label>
                  <input className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm" value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Categoría</label>
                  <select className="w-full px-5 py-3 rounded-2xl border outline-none focus:border-brand font-bold text-sm" value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})}>
                    {categorias.map(cat => <option key={cat.nombre} value={cat.nombre}>{cat.nombre}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Imagen (URL o Archivo)</label>
                  <div className="flex gap-3 items-center">
                    <div className="h-16 w-16 rounded-xl border bg-slate-50 flex items-center justify-center overflow-hidden">
                      {formData.imagen ? <img src={formData.imagen} className="h-full w-full object-cover"/> : <Image size={20} className="text-slate-300"/>}
                    </div>
                    <input className="flex-1 px-5 py-3 rounded-2xl border outline-none text-sm font-bold" placeholder="URL de imagen" value={formData.imagen} onChange={(e) => setFormData({...formData, imagen: e.target.value})}/>
                    <input type="file" accept="image/*" onChange={handleImagenUpload} className="hidden" id="file-upload"/>
                    <label htmlFor="file-upload" className="px-4 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase cursor-pointer">Subir</label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="text-[10px] font-black text-indigo-400 uppercase ml-1">Precio *</label>
                  <input type="number" step="0.01" required className="w-full px-5 py-3 rounded-2xl border-indigo-100 border outline-none font-black text-sm" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-indigo-400 uppercase ml-1">Stock *</label>
                  <input type="number" required className="w-full px-5 py-3 rounded-2xl border-indigo-100 border outline-none font-black text-sm" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Unidad</label>
                  <select className="w-full px-5 py-3 rounded-2xl border outline-none font-bold text-sm" value={formData.unidadMedida} onChange={(e) => setFormData({...formData, unidadMedida: e.target.value})}>
                    {unidadesMedida.filter(u => u.activo).map(u => <option key={u.id} value={u.nombre}>{u.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Almacén</label>
                  <select className="w-full px-5 py-3 rounded-2xl border outline-none font-bold text-sm" value={formData.almacen} onChange={(e) => setFormData({...formData, almacen: e.target.value})}>
                    {['Principal', 'Secundario', 'Temporal', 'Externo'].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-black text-slate-600 uppercase flex items-center gap-2"><Settings size={16}/> Campos Personalizados</h3>
                <button type="button" onClick={() => setShowNuevoCampo(!showNuevoCampo)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase">Nuevo Campo</button>
                
                {showNuevoCampo && (
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <input className="w-full px-4 py-2 rounded-xl border text-sm font-bold" placeholder="Nombre" value={nuevoCampo.nombre} onChange={(e) => setNuevoCampo({...nuevoCampo, nombre: e.target.value})}/>
                    </div>
                    <div className="flex-1">
                      <input className="w-full px-4 py-2 rounded-xl border text-sm font-bold" placeholder="Valor" value={nuevoCampo.valor} onChange={(e) => setNuevoCampo({...nuevoCampo, valor: e.target.value})}/>
                    </div>
                    <button type="button" onClick={() => { if(nuevoCampo.nombre) { setCamposPersonalizados([...camposPersonalizados, {...nuevoCampo, id: Date.now()}]); setNuevoCampo({nombre:'', valor:''}); setShowNuevoCampo(false); } }} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase">Añadir</button>
                  </div>
                )}

                <div className="space-y-2">
                  {camposPersonalizados.map(c => (
                    <div key={c.id} className="flex justify-between p-2 bg-slate-50 rounded-lg border text-xs">
                      <span className="font-black uppercase">{c.nombre}: <span className="font-bold normal-case text-slate-600">{c.valor}</span></span>
                      <button type="button" onClick={() => setCamposPersonalizados(camposPersonalizados.filter(cp => cp.id !== c.id))} className="text-red-500"><MinusCircle size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-brand transition-all">
                {isEditing ? 'Confirmar Cambios' : 'Registrar en Inventario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosSection;