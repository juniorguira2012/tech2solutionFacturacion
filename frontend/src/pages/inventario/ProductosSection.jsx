import React, { useState, useMemo, useEffect } from 'react';
import {
  Package, Search, Edit3, Trash2, Plus,
  FileText, LayoutGrid, List, Tag, X,
  AlertTriangle, MapPin, MessageSquare, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useInventario } from '../../context/InventarioContext';
import { useAuth } from '../../context/AuthContext';
import ProductoModal from './ProductoModal';

//Modal de Confirmación
const ConfirmModal = ({ isOpen, onConfirm, onCancel, titulo, descripcion, tipo = 'danger' }) => {
  if (!isOpen) return null;

  const esPeligro = tipo === 'danger' || tipo === 'warning';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Icono */}
        <div className={`flex justify-center pt-8 pb-4`}>
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${esPeligro ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle size={32} className={esPeligro ? 'text-red-500' : 'text-amber-500'} />
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
              esPeligro ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {tipo === 'danger' ? 'Eliminar' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

//Componente Principal 
const ProductosSection = ({ mostrarToast }) => {
  const {
    productos,
    loading,
    eliminarProducto,
    agregarProducto,
    restaurarProducto,
    actualizarProducto,
    categorias, // Mantener categorías aquí
    seriales, // <-- Traemos todos los seriales para la validación
    almacenesDetallados, // <-- Obtenemos los almacenes del contexto
    proveedores,
    unidadesMedida,
    verEliminados,
    setVerEliminados,
    actualizarSerial, // <-- Importamos la nueva función del contexto
  } = useInventario();
  const { usuario } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [vista, setVista] = useState(() => localStorage.getItem('posfactura_inventario_vista') || 'grid');
  const [filtroProducto, setFiltroProducto] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [almacenFiltro, setAlmacenFiltro] = useState('todos');
  // Estados para el nuevo visor de imágenes
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);


  // Sincroniza el filtro local con el estado del contexto para traer eliminados de la DB
  const handleCambioFiltro = (filtro) => {
    setFiltroProducto(filtro);

    // Para "todos" cargamos la lista completa (activos y eliminados).
    if (filtro === 'eliminados') {
      setVerEliminados(true);
    } else if (filtro === 'todos') {
      setVerEliminados('all');
    } else {
      setVerEliminados(false);
    }
  };


  // ─── Estado del modal de confirmación ──────────────────────────────────────
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

  // Estado inicial del formulario, definido en un solo lugar para reutilización
  const [formData, setFormData] = useState({
    nombre: '', categoria: 'General', precio: '', stock: '', codigo: '',
    modelo: '', serie: '',
    isSerialized: false, // ... (resto de campos)
    serialsInput: '', // Para nuevos seriales
    serialesExistentes: [], // Para mostrar los que ya están en la DB
    almacen: 'Principal', pasillo: '', fila: '', unidadMedida: 'Unidad', proveedorId: '',
    movimientoInventario: 'Entrada', descripcion: '', imagen: '', camposPersonalizados: []
  });

  const abrirEditar = (prod) => {
    setFormData({
      id: prod.id,
      nombre: prod.nombre,
      categoria: prod.categoria || '', // <-- CORRECCIÓN: Usar '' si no hay categoría definida
      precio: prod.precio,
      stock: prod.stock,
      codigo: prod.codigo || '',
      modelo: prod.modelo || '',
      almacen: prod.almacen || 'Principal',
      pasillo: prod.pasillo || '',
      fila: prod.fila || '',
      isSerialized: prod.isSerialized || false,
      serialsInput: '', // El campo de texto siempre inicia vacío para agregar nuevos seriales
      unidadMedida: prod.unidadMedida || 'Unidad',
      movimientoInventario: prod.movimientoInventario || 'Entrada',
      descripcion: prod.descripcion || '',
      imagen: prod.imagen || '',
      proveedorId: prod.proveedor ? prod.proveedor.id : (prod.proveedorId || ''),
      camposPersonalizados: prod.camposPersonalizados || [],
      serialesExistentes: prod.seriales || [], // <-- Cargamos los objetos de seriales completos
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };
  

  const handleUpdateSerial = async (serialId, nuevoNumero) => {
    // Esta función ahora solo llama al contexto. La actualización del estado
    // del formulario se manejará dentro del componente del modal.
    try {
      const serialActualizado = await actualizarSerial(serialId, nuevoNumero);
      return serialActualizado; // Devolvemos el resultado para que el modal lo use
    } catch (error) {
      mostrarToast(error.message || 'No se pudo actualizar el serial', 'error');
      throw error; // Re-lanzamos el error para que el modal lo sepa
    }
  };

  const handleDeleteSerial = (serialId) => {
    const serialAEliminar = formData.serialesExistentes.find(s => s.id === serialId);
    if (!serialAEliminar) return;

    // Confirmación antes de la acción destructiva
    const confirmar = window.confirm(`¿Estás seguro de que quieres eliminar el serial "${serialAEliminar.serialNumber}"? Esta acción se guardará al confirmar los cambios del producto.`);
    if (!confirmar) return;

    // Actualizamos el estado del formulario filtrando el serial
    setFormData(prev => ({
      ...prev,
      serialesExistentes: prev.serialesExistentes.filter(s => s.id !== serialId)
    }));
    mostrarToast(`Serial "${serialAEliminar.serialNumber}" marcado para eliminación.`, 'info');
  };

  const openImageViewer = (product) => {
    setViewingProduct(product);
    setIsImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
    setViewingProduct(null);
  };

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
    const campoImagen = producto.camposPersonalizados?.find(c => c.nombre === 'imagenProducto');
    return producto.imagen || campoImagen?.valor || '';
  };

  const exportarAExcel = () => {
    if (productosFiltrados.length === 0) {
      mostrarToast?.('No hay productos para exportar', 'error');
      return;
    }

    const encabezados = ['Código', 'Producto', 'Tipo', 'Precio', 'Stock', 'Almacén'];
    
    // 1. Limpiamos y formateamos las filas de forma segura
    const filas = productosFiltrados.map(p => {
      // Helper para escapar comillas dobles internas y envolver el texto si tiene comas
      const mapearCampo = (valor) => {
        const texto = String(valor ?? '').replace(/"/g, '""'); // Escapa comillas dobles internas
        return `"${texto}"`; // Envuelve el campo en comillas para proteger las comas
      };

      return [
        mapearCampo(p.codigo), 
        mapearCampo(p.nombre),
        mapearCampo(p.categoria),
        mapearCampo(p.precio),
        mapearCampo(p.stock),
        mapearCampo(p.almacen || 'Principal')
      ].join(',');
    });

    // 2. Unimos todo el contenido estructurado
    const csvContent = 'sep=,\n' + encabezados.join(',') + '\n' + filas.join('\n');

    try {
      // 3. 🚨 EL TRUCO PARA EXCEL: Añadir el BOM UTF-8 (\uFEFF) al Blob para que reconozca acentos y caracteres latinos
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // 4. Creamos el link de descarga virtual temporal
      const link = document.createElement('a');
      link.href = url;
      
      // Reemplazamos barras del formato de fecha para evitar problemas en nombres de archivos según el OS
      const fechaFormateada = new Date().toLocaleDateString().replace(/\//g, '-');
      link.setAttribute('download', `Inventario_${fechaFormateada}.csv`);
      
      // 5. Ejecutamos la descarga y limpiamos la memoria
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Libera el objeto de la memoria del navegador

      mostrarToast?.('Inventario exportado con éxito', 'success');
    } catch (error) {
      console.error("Error al exportar CSV:", error);
      mostrarToast?.('No se pudo generar el archivo de exportación', 'error');
    }
  };

// ─── Guardar / Editar ───────────────────────────────────────────────────────
const handleSave = async (e) => {
  e.preventDefault();
  setIsSaving(true);

  // Validar que la unidad de medida seleccionada exista en el catálogo cargado y esté activa
  const unidadExiste = unidadesMedida.some(u => u.nombre === formData.unidadMedida && u.activo);
  if (!unidadExiste) {
    setIsSaving(false);
    mostrarToast?.(`La unidad "${formData.unidadMedida}" no es válida. Selecciona una del catálogo.`, 'error');
    return;
  }

  // Validar si el código ya existe para evitar duplicados
  if (formData.codigo?.trim()) {
    const codigoNormalizado = formData.codigo.trim().toLowerCase();
    const productoExistente = productos.find(p => 
      p.codigo?.trim().toLowerCase() === codigoNormalizado && 
      (!isEditing || p.id !== Number(formData.id))
    );

    if (productoExistente) {
      setIsSaving(false);
      mostrarToast?.(`El código "${formData.codigo}" ya está en uso por: ${productoExistente.nombre}`, 'warning');
      return;
    }
  }

  // 1. Limpieza estricta de metadatos del frontend para evitar errores de NestJS/ValidationPipe
  const { 
    createdAt, 
    updatedAt, 
    countItems, 
    vendidos, 
    serialsInput, // <- Sacamos el string del textarea aquí
    serialesExistentes, // <- Lo sacamos también para que no vaya en el payload
    ...datosBase 
  } = formData;

  // 2. Procesamos los seriales de forma segura
  let listaSeriales = undefined;
  if (formData.isSerialized) {
    const serialesDelInput = (serialsInput || '')
      .split(/[\n,]+/)
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    // --- VALIDACIÓN DE SERIALES EXISTENTES ---
    // Verificamos si alguno de los seriales que se están intentando agregar
    // ya existe en el sistema, excluyendo los que ya pertenecen a este producto en edición.
    if (serialesDelInput.length > 0) {
      const serialesGlobales = new Set(seriales.map(s => s.serialNumber));
      const serialesPropios = new Set(serialesExistentes.map(s => s.serialNumber));
      
      for (const serial of serialesDelInput) {
        if (serialesGlobales.has(serial) && !serialesPropios.has(serial)) {
          mostrarToast?.(`El serial "${serial}" ya está registrado en el sistema.`, 'error');
          setIsSaving(false);
          return; // Detenemos el guardado
        }
      }
    }

    if (isEditing) {
      // En modo edición, combinamos los seriales existentes con los nuevos, eliminando duplicados.
      // Usamos los seriales que quedaron en el estado del formulario (ya filtrados si se eliminó alguno).
      const serialesExistentesStr = serialesExistentes.map(s => s.serialNumber);
      listaSeriales = [...new Set([...serialesExistentesStr, ...serialesDelInput])];
    } else {
      // En modo creación, solo usamos los del input.
      // Si no hay seriales en el input, la lista será un array vacío.
      listaSeriales = serialesDelInput.length > 0 ? serialesDelInput : [];
    }
  }

  // 3. Estructuramos la data final
  const dataProcesada = {
    ...datosBase,
    ubicacion: (formData.pasillo || formData.fila) 
      ? `${formData.pasillo || ''}${formData.pasillo && formData.fila ? ' - ' : ''}${formData.fila || ''}`.trim()
      : '',
    almacen: formData.almacen || 'Principal',
    id: isEditing ? Number(formData.id) : undefined, 
    precio: parseFloat(formData.precio) || 0,    
    // Si el producto NO es serializado, enviamos el stock manual.
    // Si ES serializado, el backend calculará el stock basado en la lista de seriales.
    // No enviamos 'stock' para que el backend tenga control total.
    ...(!formData.isSerialized && { stock: parseInt(formData.stock) || 0 }),

    // Enviamos el array de strings nativo que tu Backend espera en el DTO
    serials: listaSeriales
  };

  try {
    let guardado;
    if (isEditing) {
      guardado = await actualizarProducto(dataProcesada);
    } else {
      guardado = await agregarProducto(dataProcesada);
    }

    mostrarToast?.(isEditing ? 'Producto actualizado con éxito' : 'Producto creado con éxito', 'success');
    cerrarModal();

  } catch (error) {
    mostrarToast?.(error.message || 'Error al guardar producto', 'error');
    console.error("Error en handleSave:", error);
  } finally {
    setIsSaving(false);
  }
};



// ─── Eliminar ───────────────────────────────────────────────────────────────
const handleEliminar = (prod) => {
  // Verificación rápida: si no hay ID, no podemos eliminar
  console.log("ID a eliminar:", prod.id);
  if (!prod.id) {
    mostrarToast?.('Error: El producto no tiene un ID válido', 'error');
    return;
  }

  mostrarConfirm({
    titulo: '¿Eliminar permanentemente?',
    descripcion: `"${prod.nombre}" se borrará de la base de datos de forma irreversible.`,
    tipo: 'danger',
    onConfirm: async () => {
      try {
        // Asegúrate de que eliminarProducto en tu context llame a axios.delete(`${URL}/${id}`)
        const exito = await eliminarProducto(prod.id); 
        
        if (exito) {
          mostrarToast?.(`Eliminado con éxito`, 'success');
        }
      } catch (err) {
        console.error("Error al eliminar:", err);
        mostrarToast?.('El servidor rechazó la eliminación', 'error');
      } finally {
        cerrarConfirm();
      }
    },
  });
};

  const cerrarModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    // Reseteamos el formulario. La categoría ahora inicia vacía.
    setFormData({ 
      nombre: '', categoria: '', precio: '', stock: '', codigo: '', modelo: '', serie: '',
      isSerialized: false, serialsInput: '', serialesExistentes: [], almacen: 'Principal', 
      pasillo: '', fila: '', unidadMedida: 'Unidad', proveedorId: '', movimientoInventario: 'Entrada', 
      descripcion: '', imagen: '', camposPersonalizados: [] 
    }); 
  };

  const productosFiltrados = useMemo(() => productos.filter(p => {
    const query = searchTerm.toLowerCase();
    const coincideBusqueda = (p.nombre?.toLowerCase() || '').includes(query) || (p.codigo?.toLowerCase() || '').includes(query);
    const coincideAlmacen = almacenFiltro === 'todos' || (p.almacen || 'Principal') === almacenFiltro;
    const estaActivo = p.isActive !== false;
    const coincideTipo =
      filtroProducto === 'todos' ||
      (filtroProducto === 'productos' && p.categoria !== 'Servicios') ||
      (filtroProducto === 'servicios' && p.categoria === 'Servicios') ||
      (filtroProducto === 'activos' && estaActivo) ||
      (filtroProducto === 'eliminados' && p.isActive === false);
    return coincideBusqueda && coincideAlmacen && coincideTipo;
  }), [productos, searchTerm, almacenFiltro, filtroProducto]);

  return (
    <div className="space-y-4">

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirm.isOpen}
        titulo={confirm.titulo}
        descripcion={confirm.descripcion}
        tipo={confirm.tipo}
        onConfirm={confirm.onConfirm}
        onCancel={cerrarConfirm}
      />

      {/* Modal Visor de Imagen del Producto */}
      {isImageViewerOpen && viewingProduct && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-lg p-4 animate-in fade-in duration-300"
          onClick={closeImageViewer}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del contenido cierre el modal
          >
            <button 
              onClick={closeImageViewer} 
              className="absolute -top-4 -right-4 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-3/5 bg-slate-100 flex items-center justify-center">
                <img 
                  src={obtenerImagenProducto(viewingProduct)} 
                  alt={viewingProduct.nombre} 
                  className="max-h-[80vh] w-full h-full object-contain"
                />
              </div>
              <div className="md:w-2/5 p-8 space-y-4">
                <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-[9px] font-black uppercase">{viewingProduct.categoria}</span>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{viewingProduct.nombre}</h2>
                {viewingProduct.codigo && <p className="text-xs font-bold text-slate-400">CÓDIGO: <span className="font-mono">{viewingProduct.codigo}</span></p>}
                <div className="flex items-baseline gap-2 pt-4 border-t">
                  <span className="text-3xl font-black text-slate-800">RD$ {formatPrice(viewingProduct.precio)}</span>
                </div>
                <p className={`text-sm font-bold ${viewingProduct.stock <= LOW_STOCK_THRESHOLD ? 'text-red-500' : 'text-emerald-600'}`}>Stock disponible: {viewingProduct.stock}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {['todos', 'productos', 'servicios', 'activos', 'eliminados'].map(tipo => (
            <button key={tipo} onClick={() => handleCambioFiltro(tipo)}
              className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all ${
                filtroProducto === tipo ? 'bg-brand text-white border-brand shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}>
              {tipo}
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

      {/* Buscador */}
      <div className="flex flex-col xl:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
          <input type="text" placeholder="Buscar por nombre o código..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 outline-none text-xs font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
        <select value={almacenFiltro} onChange={(e) => setAlmacenFiltro(e.target.value)} className="min-w-44 h-9 px-3 rounded-lg border border-slate-200 text-[10px] font-black uppercase text-slate-600 bg-white">
          <option value="todos">Todos los almacenes</option>
          {almacenesDetallados.map(al => <option key={al.id} value={al.nombre}>{al.nombre}</option>)}
        </select>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="py-20 text-center text-xs font-black uppercase text-slate-400">Cargando...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-20 text-center text-xs font-black uppercase text-slate-400">No hay productos</div>
        ) : vista === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3 p-3">
            {productosFiltrados.map(prod => (
              <article 
                key={prod.id} 
                className="group rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:-translate-y-0.5 relative cursor-pointer"
                onClick={() => obtenerImagenProducto(prod) && openImageViewer(prod)}
                title={obtenerImagenProducto(prod) ? "Clic para ampliar imagen" : "Sin imagen"}
              >
                <div 
                  className="aspect-[2.5/1] bg-slate-50 relative border-b border-slate-100"
                >
                  {obtenerImagenProducto(prod)
                    ? <img src={obtenerImagenProducto(prod)} alt={prod.nombre} className="h-full w-full object-cover"/>
                    : <div className="h-full w-full flex items-center justify-center text-slate-200"><Package size={20}/></div>}
                  <div className="absolute left-2 top-2">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-white ${prod.categoria === 'Servicios' ? 'bg-sky-500' : 'bg-slate-900'}`}>
                      {prod.categoria === 'Servicios' ? 'Servicio' : 'Producto'}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-black text-slate-800 uppercase text-xs truncate">{prod.nombre}</h3>
                    <p className="font-black text-slate-900 text-xs italic whitespace-nowrap">RD$ {formatPrice(prod.precio)}</p>
                  </div>
                  {prod.proveedor && <p className="text-[8px] font-black text-brand uppercase tracking-widest -mt-1">{prod.proveedor.nombre}</p>}
                  <div className="flex gap-2">
                    <div className={`w-14 shrink-0 rounded-lg p-1.5 border ${prod.stock <= LOW_STOCK_THRESHOLD ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <p className="text-[8px] font-black uppercase opacity-70">Stock</p>
                      <span className="text-xs font-black">{prod.stock}</span>
                    </div>
                    <div 
                      className="flex-1 bg-slate-50 p-1.5 rounded-lg border overflow-hidden cursor-help"
                      title={`Almacén: ${prod.almacen || 'Principal'}${prod.ubicacion ? `\nUbicación: ${prod.ubicacion}` : ''}`}
                    >
                      <p className="text-[8px] font-black text-slate-400 uppercase">Almacén / Ubicación</p>
                      <div className="max-h-[40px] overflow-y-auto flex flex-col justify-center">
                        <p className="text-[9px] font-black truncate text-slate-700 uppercase leading-tight">
                          {prod.almacen || 'Principal'}
                        </p>
                        {prod.ubicacion && (
                          <div className="flex items-center gap-1 text-brand mt-0.5">
                            <MapPin size={10} strokeWidth={3} />
                            <span className="text-[8px] font-black truncate uppercase">{prod.ubicacion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* --- INICIO: Mostrar Seriales Disponibles --- */}
                  {prod.isSerialized && (() => {
                    const serialesDisponibles = prod.seriales?.filter(s => s.status === 'disponible') || [];
                    return (
                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Seriales Disponibles ({serialesDisponibles.length})</p>
                        {serialesDisponibles.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {serialesDisponibles.slice(0, 3).map(s => (
                              <div key={s.id} className="flex items-center gap-1 bg-slate-200 text-slate-700 rounded px-1.5 py-0.5" title={s.lastReturnNote ? `Última devolución: ${s.lastReturnNote}` : ''}>
                                <span className="text-[9px] font-mono font-bold">{s.serialNumber}</span>
                                {s.lastReturnNote && <MessageSquare size={10} className="text-slate-500" />}
                              </div>
                            ))}
                            {serialesDisponibles.length > 3 && (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">+{serialesDisponibles.length - 3} más</span>
                            )}
                          </div>
                        ) : <p className="text-[9px] text-slate-400 italic mt-1">No hay seriales disponibles.</p>}
                      </div>
                    );
                  })()}
                  {/* --- FIN: Mostrar Seriales Disponibles --- */}
                  <div className="px-1 py-1 text-right flex items-center justify-end gap-1 border-t border-slate-50 mt-2">
                    {prod.isActive === false ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); restaurarProducto(prod.id); }} 
                        className="px-3 py-1.5 text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Restaurar
                      </button>
                    ) : (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); abrirEditar(prod); }} className="p-1.5 text-brand hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit3 size={16}/>
                        </button>
                        {permisoInventario === 'full' && (
                          <button onClick={(e) => { e.stopPropagation(); handleEliminar(prod); }} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                            <Trash2 size={16}/>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[9px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4 w-1/3">Almacén / Ubicación</th>
                <th className="px-6 py-4 text-center w-20">Stock</th>
                <th className="px-6 py-4 text-right">Precio</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {productosFiltrados.map(prod => (
                <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-black text-slate-700 uppercase text-xs">{prod.nombre}</p>
                    {/* --- INICIO: Mostrar Seriales en Tooltip --- */}
                    {prod.isSerialized && (() => {
                      const serialesDisponibles = prod.seriales?.filter(s => s.status === 'disponible') || [];
                      // 💡 MEJORA: El tooltip ahora muestra la nota de devolución si existe.
                      const serialesTooltip = serialesDisponibles
                        .map(s => s.serialNumber + (s.lastReturnNote ? ` (Devuelto: ${s.lastReturnNote})` : ''))
                        .join('\n');

                      return (
                        <div 
                          className="flex items-center gap-1.5 text-brand mt-1 cursor-help"
                          title={serialesDisponibles.length > 0 ? `Seriales Disponibles:\n${serialesTooltip}` : 'Producto serializado sin stock disponible'}
                        >
                          <Tag size={12} />
                          <span className="text-[9px] font-black uppercase italic">{serialesDisponibles.length} seriales disponibles</span>
                        </div>
                      );
                    })()}
                    {/* --- FIN: Mostrar Seriales en Tooltip --- */}
                  </td>
                  <td className="px-6 py-3">
                    <div 
                      className="flex flex-col cursor-help"
                      title={`Almacén: ${prod.almacen || 'Principal'}${prod.ubicacion ? `\nUbicación: ${prod.ubicacion}` : ''}`}
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{prod.almacen || 'Principal'}</span>
                      {prod.ubicacion && (
                        <div className="flex items-center gap-1 text-brand">
                          <MapPin size={10} />
                          <span className="text-[9px] font-black uppercase italic">{prod.ubicacion}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center font-black">{prod.stock}</td>
                  <td className="px-6 py-3 text-right font-black italic">RD$ {formatPrice(prod.precio)}</td>
                  <td className="px-6 py-3 text-right flex items-center justify-end gap-1">
                    {prod.isActive === false ? (
                      <button 
                        onClick={() => restaurarProducto(prod.id)} 
                        className="px-3 py-1.5 text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Restaurar
                      </button>
                    ) : (
                      <>
                        <button onClick={() => abrirEditar(prod)} className="p-1.5 text-brand hover:bg-indigo-50 rounded-lg transition-colors"><Edit3 size={16}/></button>
                        {permisoInventario === 'full' && (
                          <button onClick={() => handleEliminar(prod)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nuevo / Editar Producto */}
      <ProductoModal
        isOpen={isModalOpen}
        onClose={cerrarModal}
        onSubmit={handleSave}
        isEditing={isEditing}
        isSaving={isSaving}
        formData={formData}
        setFormData={setFormData}
        categorias={categorias}
        proveedores={proveedores}
        unidadesMedida={unidadesMedida}
        almacenesDetallados={almacenesDetallados}
        handleUpdateSerial={handleUpdateSerial}
        mostrarToast={mostrarToast}
        handleDeleteSerial={handleDeleteSerial}
      />
    </div>
  );
};

export default ProductosSection;