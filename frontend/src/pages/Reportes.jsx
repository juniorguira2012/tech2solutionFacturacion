import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useVentas } from '../context/VentasContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../context/AuthContext';
import {
  Search, Calendar, FileText, Table, DollarSign, 
  Hash, Users, Star, Package, TrendingUp, BarChart2, Lock, Edit, Trash2, Plus, X
} from 'lucide-react';

// IMPORTAR LIBRERÍAS DE EXPORTACIÓN Y DATEPICKER
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 💡 Pasamos `auditorias` como prop para que el padre pueda acceder a los datos
const AuditoriaIngresosSection = ({ permisos }) => {
  const { usuario, getAuthHeaders } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

  const [auditorias, setAuditorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 💡 CORRECCIÓN: Se define el estado para el formulario del nuevo cuadre.
  const [nuevoCuadre, setNuevoCuadre] = useState({
    totalSistema: '15200.50', efectivo: '', tarjeta: '', transferencia: '', otros: '', nota: ''
  });

  const totalContadoCalculado = useMemo(() => {
    const { efectivo, tarjeta, transferencia, otros } = nuevoCuadre;
    return (Number(efectivo) || 0) + (Number(tarjeta) || 0) + (Number(transferencia) || 0) + (Number(otros) || 0);
  }, [nuevoCuadre]);

  const diferenciaCalculada = useMemo(() => {
    return totalContadoCalculado - (Number(nuevoCuadre.totalSistema) || 0);
  }, [totalContadoCalculado, nuevoCuadre.totalSistema]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoCuadre(prev => ({ ...prev, [name]: value }));
  };

  // 💡 FUNCIÓN PARA CARGAR AUDITORÍAS DESDE EL BACKEND
  const cargarAuditorias = useCallback(async () => {
    if (!permisos?.view) return;
    try {
      const response = await fetch(`${API_BASE_URL}/audits/cash-closures`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Error al cargar auditorías');
      const data = await response.json();
      // 💡 Asumimos que el backend devuelve el nombre del usuario en la consulta
      setAuditorias(data);
    } catch (error) {
      console.error("Error cargando auditorías:", error);
    }
  }, [API_BASE_URL, getAuthHeaders, permisos?.view]);

  const handleGuardarCuadre = async (e) => {
    e.preventDefault();
    if (!permisos?.create) return;

    setIsSaving(true);
    try {
      const payload = {
        userId: usuario.id,
        totalSistema: Number(nuevoCuadre.totalSistema),
        totalContado: totalContadoCalculado,
        desglose: {
          efectivo: Number(nuevoCuadre.efectivo) || 0,
          tarjeta: Number(nuevoCuadre.tarjeta) || 0,
          transferencia: Number(nuevoCuadre.transferencia) || 0,
          otros: Number(nuevoCuadre.otros) || 0,
        },
        diferencia: diferenciaCalculada,
        nota: nuevoCuadre.nota,
      };

      const response = await fetch(`${API_BASE_URL}/audits/cash-closures`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el cuadre');
      }

      // 💡 CORRECCIÓN: En lugar de simular, recargamos los datos reales desde la DB.
      await cargarAuditorias();

      setShowModal(false);
      setNuevoCuadre({
        totalSistema: '15200.50', efectivo: '', tarjeta: '', transferencia: '', otros: '', nota: ''
      });

    } catch (error) {
      console.error("Error guardando cuadre:", error);
      // Aquí podrías usar un toast para mostrar el error
    } finally {
      setIsSaving(false);
    }
  };

  // 💡 Cargar auditorías reales desde el backend al montar el componente
  useEffect(() => {
    cargarAuditorias();
  }, [cargarAuditorias]);

  const totalAuditado = useMemo(() => auditorias.reduce((acc, a) => acc + a.totalSistema, 0), [auditorias]);
  const totalDiferencia = useMemo(() => auditorias.reduce((acc, a) => acc + a.diferencia, 0), [auditorias]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4">
      {/* KPIs de Auditoría */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase italic">Total Registrado en Sistema</p>
          <h3 className="text-2xl font-black text-slate-800 italic mt-1">RD$ {totalAuditado.toLocaleString()}</h3>
        </div>
        <div className={`p-6 rounded-[2.5rem] border shadow-sm ${totalDiferencia !== 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <p className={`text-[10px] font-black uppercase italic ${totalDiferencia !== 0 ? 'text-rose-500' : 'text-emerald-600'}`}>Desajuste Total (Faltante/Sobrante)</p>
          <h3 className={`text-2xl font-black italic mt-1 ${totalDiferencia !== 0 ? 'text-rose-600' : 'text-emerald-700'}`}>RD$ {totalDiferencia.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase italic">Cierres de Caja Realizados</p>
          <h3 className="text-2xl font-black text-slate-800 italic mt-1">{auditorias.length}</h3>
        </div>
      </div>

      {/* Tabla de Auditorías */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-end">
          {permisos?.create && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-brand transition-all">
              <Plus size={14} /> Registrar Nuevo Cuadre
            </button>
          )}
        </div>
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-6 py-4">Fecha y Hora</th>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4 text-right">Total Sistema</th>
              <th className="px-6 py-4 text-right">Total Contado</th>
              <th className="px-6 py-4 text-right">Diferencia</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {auditorias.map(a => (
              <tr key={a.id} className="hover:bg-slate-50/80 font-bold">
                <td className="px-6 py-4 text-slate-500">{new Date(a.fecha || a.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-700 uppercase">{a.usuario}</td>
                <td className="px-6 py-4 text-right text-slate-600">RD$ {a.totalSistema.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-slate-800 font-black">RD$ {a.totalContado.toLocaleString()}</td>
                <td className={`px-6 py-4 text-right font-black ${a.diferencia < 0 ? 'text-red-500' : a.diferencia > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {a.diferencia.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-1">
                    {permisos?.edit && <button className="p-2 text-slate-400 hover:text-brand rounded-lg"><Edit size={14} /></button>}
                    {permisos?.delete && <button className="p-2 text-slate-400 hover:text-red-500 rounded-lg"><Trash2 size={14} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para Registrar Nuevo Cuadre */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Registrar Cuadre de Caja</h2>
              <button onClick={() => setShowModal(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 shadow-sm transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleGuardarCuadre} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Total según Sistema</label>
                  <input type="number" step="0.01" name="totalSistema" value={nuevoCuadre.totalSistema} onChange={handleInputChange}
                    className="w-full bg-transparent text-lg font-black text-slate-700 outline-none" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Total Contado Físico</label>
                  <p className="text-lg font-black text-brand">RD$ {totalContadoCalculado.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Desglose del Conteo Físico</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400">Efectivo</label>
                    <input type="number" step="0.01" name="efectivo" value={nuevoCuadre.efectivo} onChange={handleInputChange} placeholder="0.00"
                      className="w-full p-2 border rounded-lg font-bold text-sm" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400">Tarjeta</label>
                    <input type="number" step="0.01" name="tarjeta" value={nuevoCuadre.tarjeta} onChange={handleInputChange} placeholder="0.00"
                      className="w-full p-2 border rounded-lg font-bold text-sm" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400">Transferencia</label>
                    <input type="number" step="0.01" name="transferencia" value={nuevoCuadre.transferencia} onChange={handleInputChange} placeholder="0.00"
                      className="w-full p-2 border rounded-lg font-bold text-sm" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400">Otros</label>
                    <input type="number" step="0.01" name="otros" value={nuevoCuadre.otros} onChange={handleInputChange} placeholder="0.00"
                      className="w-full p-2 border rounded-lg font-bold text-sm" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <label className="text-[10px] font-black text-slate-500 uppercase">Nota Adicional (Opcional)</label>
                <textarea name="nota" value={nuevoCuadre.nota} onChange={handleInputChange} rows="2"
                  className="w-full p-3 border rounded-lg mt-1 text-sm" placeholder="Ej: Diferencia por error en devolución..."></textarea>
              </div>

              <div className={`p-4 rounded-2xl text-center ${diferenciaCalculada !== 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <p className={`text-[9px] font-black uppercase ${diferenciaCalculada !== 0 ? 'text-rose-500' : 'text-emerald-600'}`}>Diferencia (Faltante/Sobrante)</p>
                <p className={`text-2xl font-black ${diferenciaCalculada !== 0 ? 'text-rose-600' : 'text-emerald-700'}`}>RD$ {diferenciaCalculada.toLocaleString()}</p>
              </div>

              <button type="submit" disabled={isSaving} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-brand transition-all uppercase text-[10px] tracking-widest disabled:opacity-50">
                {isSaving ? 'Guardando...' : 'Confirmar y Cerrar Caja'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTE PARA EL GRÁFICO DE VENTAS ---
const VentasChart = ({ data }) => {
  // Formateamos los datos para que el eje X sea más legible y ordenamos por fecha.
  const chartData = data
    .map(item => ({
      ...item,
      // Extraemos solo el día y el mes para un eje X más limpio.
      fechaCorta: new Date(item.periodo.split('/').reverse().join('-')).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' }),
    }))
    .sort((a, b) => new Date(a.periodo.split('/').reverse().join('-')) - new Date(b.periodo.split('/').reverse().join('-')));

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm h-80 animate-in fade-in duration-500">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="fechaCorta" tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(value) => `RD$${(value/1000)}k`} />
          <Tooltip formatter={(value) => [`RD$ ${Number(value).toLocaleString()}`, 'Ingresos']} cursor={{ fill: 'rgba(100, 116, 139, 0.05)' }} />
          <Bar dataKey="total" fill="#4f46e5" name="Ingresos" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Reportes = () => {
  const { historialVentas } = useVentas();
  const { usuario } = useAuth(); // 🚀 Obtenemos el usuario actual
  const permisos = usePermissions('reportes'); // 🛡️ Obtenemos permisos para el módulo
  const esAdmin = usuario?.rol === 'admin';

  // 🛡️ Determinamos qué sub-módulos puede ver el usuario
  const puedeVerVentas = esAdmin || permisos.subModulos?.reporte_ventas?.view;
  const puedeVerClientes = esAdmin || permisos.subModulos?.reporte_clientes?.view;
  const puedeVerAuditoria = esAdmin || permisos.subModulos?.auditoria_ingresos?.view;
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [busquedaGlobal, setBusquedaGlobal] = useState(""); 
  
  // 💡 Estado para las auditorías, gestionado por el componente padre
  const [auditorias, setAuditorias] = useState([
    { id: 1, fecha: '2023-10-27T10:00:00Z', usuario: 'Ana', totalSistema: 15200.50, totalContado: 15200.00, diferencia: -0.50, estado: 'Cerrado' },
    { id: 2, fecha: '2023-10-26T22:00:00Z', usuario: 'Juan', totalSistema: 25450.00, totalContado: 25450.00, diferencia: 0.00, estado: 'Cerrado' },
    { id: 3, fecha: '2023-10-26T14:00:00Z', usuario: 'Ana', totalSistema: 12300.00, totalContado: 12350.00, diferencia: 50.00, estado: 'Cerrado con Diferencia' },
  ]);


  // �️ La pestaña activa por defecto es la primera a la que tenga acceso
  // 🚀 CORRECCIÓN: Si es admin, siempre empieza en 'ventas'.
  const [tabActiva, setTabActiva] = useState(() => {
    if (usuario?.rol === 'admin' || puedeVerVentas) return 'ventas';
    if (puedeVerClientes) return 'clientes';
    if (puedeVerAuditoria) return 'auditoria';
    return null;
  });
  
  // Agrupación de ventas ('transacciones', 'dias', 'meses')
  const [agrupacionVentas, setAgrupacionVentas] = useState('transacciones');

  // ==========================================
  // 🛠️ FILTROS RÁPIDOS DE TIEMPO (PRESETS)
  // ==========================================
  const aplicarPresetFecha = (tipo) => {
    const hoy = new Date();
    switch (tipo) {
      case 'hoy':
        setStartDate(hoy);
        setEndDate(hoy);
        break;
      case 'ayer':
        const ayer = new Date();
        ayer.setDate(hoy.getDate() - 1);
        setStartDate(ayer);
        setEndDate(ayer);
        break;
      case 'mes':
        setStartDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
        setEndDate(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0));
        break;
      case 'mes_anterior':
        setStartDate(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1));
        setEndDate(new Date(hoy.getFullYear(), hoy.getMonth(), 0));
        break;
      case 'anio':
        setStartDate(new Date(hoy.getFullYear(), 0, 1));
        setEndDate(new Date(hoy.getFullYear(), 12, 0));
        break;
      default:
        break;
    }
  };

  // ==========================================
  // 1. FILTRADO MAESTRO (Rango de Fechas + Buscador)
  // ==========================================
  const ventasFiltradas = useMemo(() => {
    return historialVentas.filter(v => {
      const fechaVenta = new Date(v.fecha);
      const inicio = new Date(startDate); inicio.setHours(0, 0, 0, 0);
      const fin = new Date(endDate); fin.setHours(23, 59, 59, 999);
      const cumpleFecha = fechaVenta >= inicio && fechaVenta <= fin;

      const busqueda = busquedaGlobal.toLowerCase();
      const nombreVendedor = (v.vendedorNombre || v.usuario || "Admin").toLowerCase();
      const nombreCliente = (v.cliente || "Consumidor Final").toLowerCase();
      return cumpleFecha && (busqueda === "" || nombreVendedor.includes(busqueda) || nombreCliente.includes(busqueda));
    });
  }, [historialVentas, startDate, endDate, busquedaGlobal]);

  // ==========================================
  // 2. AGRUPACIONES CRONOLÓGICAS (Día / Mes)
  // ==========================================
  const ventasAgrupadas = useMemo(() => {
    if (agrupacionVentas === 'transacciones') return ventasFiltradas;

    const mapaAgrupado = ventasFiltradas.reduce((acc, v) => {
      const d = new Date(v.fecha);
      const llave = agrupacionVentas === 'dias' 
        ? d.toLocaleDateString('es-DO', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : d.toLocaleDateString('es-DO', { year: 'numeric', month: 'long' });

      if (!acc[llave]) {
        acc[llave] = { periodo: llave, total: 0, transacciones: 0 };
      }
      
      // 🌟 CORRECCIÓN 1: Forzar suma numérica en la agrupación cronológica (Evita el bug de las capturas)
      acc[llave].total += Number(v.total || 0);
      acc[llave].transacciones += 1;
      return acc;
    }, {});

    return Object.values(mapaAgrupado).sort((a, b) => b.periodo.localeCompare(a.periodo));
  }, [ventasFiltradas, agrupacionVentas]);

  // ==========================================
  // 3. CÁLCULOS AVANZADOS (KPIs)
  // ==========================================
  const statsVentas = useMemo(() => {
    let totalDinero = 0;
    let totalProductosCant = 0;
    const conteoProductos = {};

    ventasFiltradas.forEach(venta => {
      totalDinero += Number(venta.total || 0);
      
      const items = venta.productos || venta.articulos || [];
      items.forEach(item => {
        const cant = Number(item.cantidad) || 1;
        totalProductosCant += cant;
        const nombreProd = item.nombre || item.descripcion || "Producto";
        conteoProductos[nombreProd] = (conteoProductos[nombreProd] || 0) + cant;
      });
    });

    const topProducto = Object.entries(conteoProductos).reduce((a, b) => 
      (b[1] > (a[1] || 0) ? b : a), ["Ninguno", 0]
    );

    return {
      total: totalDinero,
      facturas: ventasFiltradas.length,
      unidades: totalProductosCant,
      productoEstrella: topProducto[0],
      cantEstrella: topProducto[1]
    };
  }, [ventasFiltradas]);

  // ==========================================
  // 3.5 RANKING DE CLIENTES CORREGIDO
  // ==========================================
  const reporteClientes = useMemo(() => {
    const clientesMap = ventasFiltradas.reduce((acc, v) => {
      const nombre = v.cliente || "Consumidor Final";
      if (!acc[nombre]) acc[nombre] = { nombre, total: 0, visitas: 0 };
      
      // 🌟 CORRECCIÓN 2: Forzar número real al acumular las compras del cliente
      acc[nombre].total += Number(v.total || 0);
      acc[nombre].visitas += 1;
      return acc;
    }, {});
    return Object.values(clientesMap).sort((a, b) => b.total - a.total);
  }, [ventasFiltradas]);

  // ==========================================
  // 4. EXPORTACIONES MÁSTER (EXCEL Y PDF)
  // ==========================================
  const exportarExcel = () => {
    let data = [];
    let nombreArchivo = "";

    if (tabActiva === 'ventas') {
      if (agrupacionVentas === 'transacciones') {
        data = ventasFiltradas.map(v => ({ 
          'Referencia': `#${v.id.toString().slice(-6)}`, 
          'Fecha': v.fecha.split('T')[0], 
          'Cajero': v.vendedorNombre || 'Admin', 
          'Cliente': v.cliente || 'Consumidor Final', 
          'Total (RD$)': Number(v.total || 0) // 🌟 CORRECCIÓN 3
        }));
        nombreArchivo = "Ventas_Detalladas";
      } else {
        data = ventasAgrupadas.map(a => ({ 
          'Periodo / Fecha': a.periodo, 
          'Cantidad Facturas': a.transacciones, 
          'Total Recaudado (RD$)': Number(a.total || 0) // 🌟 CORRECCIÓN 4
        }));
        nombreArchivo = `Ventas_Agrupadas_por_${agrupacionVentas}`;
      }
    } else if (tabActiva === 'clientes') {
      data = reporteClientes.map(c => ({ 
        'Cliente': c.nombre, 
        'Facturas Emitidas': c.visitas, 
        'Inversión Total (RD$)': Number(c.total || 0) // 🌟 CORRECCIÓN 5
      }));
      nombreArchivo = "Ranking_Clientes";
    } else if (tabActiva === 'auditoria') {
      data = auditorias.map(a => ({
        'ID': a.id,
        'Fecha': new Date(a.fecha).toLocaleString(),
        'Usuario': a.usuario,
        'Total Sistema (RD$)': a.totalSistema,
        'Total Contado (RD$)': a.totalContado,
        'Diferencia (RD$)': a.diferencia,
        'Estado': a.estado,
      }));
      nombreArchivo = "Auditoria_Ingresos";
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Comercial");

    // 💡 CORRECCIÓN: Se ajusta el ancho de las columnas para una mejor visualización.
    // Se eliminó la variable 'maxProps' que no estaba definida y causaba un error.
    if (data.length > 0) {
      ws['!cols'] = Object.keys(data[0]).map(() => ({ wch: 25 }));
    }

    XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ONERED RD - REPORTES DE SISTEMA", 14, 15);
    doc.setFontSize(10);
    doc.text(`Módulo: ${tabActiva === 'ventas' ? `Ventas (${agrupacionVentas.toUpperCase()})` : 'Ranking de Clientes'}`, 14, 22);
    doc.text(`Rango de Evaluación: ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}`, 14, 27);

    let headers = [];
    let rows = [];

    if (tabActiva === 'ventas') {
      if (agrupacionVentas === 'transacciones') {
        headers = [["REF", "FECHA", "CAJERO", "CLIENTE", "TOTAL"]];
        rows = ventasFiltradas.map(v => [
          v.id.toString().slice(-6), 
          v.fecha.split('T')[0], 
          v.vendedorNombre || 'Admin', 
          v.cliente || 'Consumidor Final', 
          `RD$ ${Number(v.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` // 🌟 CORRECCIÓN 6
        ]);
      } else {
        headers = [[agrupacionVentas === 'dias' ? "FECHA / DÍA" : "MES", "FACTURAS", "TOTAL RECAUDADO"]];
        rows = ventasAgrupadas.map(a => [
          a.periodo, 
          a.transacciones, 
          `RD$ ${Number(a.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` // 🌟 CORRECCIÓN 7
        ]);
      }
    } else {
      headers = [["POS", "CLIENTE", "COMPRAS REALIZADAS", "INVERSIÓN TOTAL"]];
      rows = reporteClientes.map((c, i) => [
        i + 1, 
        c.nombre, 
        `${c.visitas} vtas`, 
        `RD$ ${Number(c.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` // 🌟 CORRECCIÓN 8
      ]);
    }

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 33,
      headStyles: { fillColor: [15, 23, 42] },
      theme: 'striped'
    });
    
    doc.save(`Reporte_${tabActiva}_${new Date().getTime()}.pdf`);
  };

  // 🛡️ Muro de seguridad si no tiene acceso a ningún reporte
  if (!esAdmin && !permisos.view) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-in fade-in duration-300">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-200 max-w-md">
          <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Acceso Restringido</h2>
          <p className="text-slate-500 font-medium mt-2">Tu perfil de usuario no tiene autorización para ver los reportes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-2 animate-in fade-in duration-500">
      
      {/* PANEL DE CONTROL SUPERIOR */}
      <header className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-none">
              {tabActiva === 'ventas' ? 'Reporte de Ingresos' : 'Cartera de Clientes'}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">
              Control De Ingresos y Auditoría de Caja
            </p>
          </div>

          {/* FILTROS RÁPIDOS Y CALENDARIO */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Presets de Tiempo */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-500">
              <button onClick={() => aplicarPresetFecha('hoy')} className="px-2 py-1.5 hover:bg-white rounded-lg transition-all">Hoy</button>
              <button onClick={() => aplicarPresetFecha('ayer')} className="px-2 py-1.5 hover:bg-white rounded-lg transition-all">Ayer</button>
              <button onClick={() => aplicarPresetFecha('mes')} className="px-2 py-1.5 hover:bg-white rounded-lg transition-all">Este Mes</button>
              <button onClick={() => aplicarPresetFecha('mes_anterior')} className="px-2 py-1.5 hover:bg-white rounded-lg transition-all">Mes Ant.</button>
              <button onClick={() => aplicarPresetFecha('anio')} className="px-2 py-1.5 hover:bg-white rounded-lg transition-all">Año</button>
            </div>

            {/* Input Calendario */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <Calendar size={14} className="text-slate-900" />
              <DatePicker
                selectsRange startDate={startDate} endDate={endDate}
                onChange={(update) => { setStartDate(update[0]); setEndDate(update[1]); }}
                className="outline-none font-black text-[10px] uppercase text-slate-600 cursor-pointer w-36" 
                dateFormat="dd/MM/yyyy"
              />
            </div>

            {/* Buscador */}
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-slate-900 transition-all">
              <Search size={14} className="text-slate-400" />
              <input 
                type="text" 
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
                placeholder="Buscar Cajero o Cliente..."
                className="outline-none text-slate-700 font-black text-[11px] uppercase w-44 bg-transparent"
              />
            </div>

            {/* Descargas */}
            <div className="flex gap-1 bg-300 p-1.5 rounded-2xl shadow-md">
              <button onClick={exportarPDF} className="p-2 text-red-400 hover:text-white rounded-xl transition-all" title="Descargar PDF Administrativo">
                <FileText size={16} />
              </button>
              <button onClick={exportarExcel} className="p-2 text-emerald-400 hover:text-white rounded-xl transition-all" title="Descargar Excel Comercial">
                <Table size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL ENTRE TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div className="flex gap-3">
            {puedeVerVentas && (
              <button onClick={() => setTabActiva('ventas')} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tabActiva === 'ventas' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Ventas Generales</button>
            )}
            {puedeVerClientes && (
              <button onClick={() => setTabActiva('clientes')} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tabActiva === 'clientes' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Ranking de Clientes</button>
            )}
            {puedeVerAuditoria && (
              <button onClick={() => setTabActiva('auditoria')} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tabActiva === 'auditoria' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Auditoría de Ingresos</button>
            )}
          </div>

          {/* SEGMENTACIÓN SUB-REPORTES CRONOLÓGICOS (Solo si estás en la tab Ventas) */}
          {tabActiva === 'ventas' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button onClick={() => setAgrupacionVentas('transacciones')} className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${agrupacionVentas === 'transacciones' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Por Transacción</button>
              <button onClick={() => setAgrupacionVentas('dias')} className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${agrupacionVentas === 'dias' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Por Día</button>
              <button onClick={() => setAgrupacionVentas('meses')} className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${agrupacionVentas === 'meses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Por Mes</button>
            </div>
          )}
        </div>
      </header>

      {/* RENDER DE LA SECCIÓN DE VENTAS */}
      {tabActiva === 'ventas' && puedeVerVentas && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          {/* CARDS DE STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <DollarSign className="absolute -right-2 -top-2 opacity-10" size={80} />
              <p className="text-[10px] font-blue uppercase opacity-60 italic">Total Neto Recaudado</p>
              <h3 className="text-2xl font-black italic mt-1">
                RD$ {statsVentas.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <Hash className="absolute right-4 top-4 text-slate-100" size={30} />
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Volumen Facturas</p>
              <h3 className="text-2xl font-black text-slate-800 italic mt-1">{statsVentas.facturas}</h3>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <Package className="absolute right-4 top-4 text-slate-100" size={30} />
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Artículos Despachados</p>
              <h3 className="text-2xl font-black text-slate-800 italic mt-1">{statsVentas.unidades} uds</h3>
            </div>
            <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <Star className="absolute right-4 top-4 opacity-20" size={30} />
              <p className="text-[10px] font-black uppercase opacity-70 italic">Líder en Salidas</p>
              <h3 className="text-sm font-black uppercase truncate mt-1 leading-tight" title={statsVentas.productoEstrella}>
                {statsVentas.productoEstrella}
              </h3>
              <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full mt-2 inline-block">
                {statsVentas.cantEstrella} unidades
              </span>
            </div>
          </div>

          {/* GRÁFICO DE BARRAS (Solo para agrupación por días) */}
          {agrupacionVentas === 'dias' && ventasAgrupadas.length > 0 && (
            <VentasChart data={ventasAgrupadas} />
          )}

          {/* TABLA DINÁMICA DE VENTAS (MUTABLE SEGÚN AGRUPACIÓN) */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                {agrupacionVentas === 'transacciones' ? (
                  <tr className="text-slate-400 text-[9px] uppercase font-black tracking-widest">
                    <th className="px-8 py-5 text-slate-900 italic">Ref</th>
                    <th className="px-8 py-5">Cajero</th>
                    <th className="px-8 py-5">Cliente</th>
                    <th className="px-8 py-5 text-right">Total</th>
                  </tr>
                ) : (
                  <tr className="text-slate-400 text-[9px] uppercase font-black tracking-widest">
                    <th className="px-8 py-5 text-slate-900 italic flex items-center gap-2"><BarChart2 size={12}/> Período de Tiempo</th>
                    <th className="px-8 py-5 text-center">Facturas Procesadas</th>
                    <th className="px-8 py-5 text-right">Monto Bruto Recaudado</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50">
                {agrupacionVentas === 'transacciones' ? (
                  ventasAgrupadas.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-4 font-mono font-bold text-slate-400">#{v.id.toString().slice(-6)}</td>
                      <td className="px-8 py-4 font-black text-slate-600 uppercase">{v.vendedorNombre || "Admin"}</td>
                      <td className="px-8 py-4 font-bold text-slate-800 uppercase">{v.cliente || "Consumidor Final"}</td>
                      <td className="px-8 py-4 text-right font-black text-slate-900">RD$ {v.total.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  ventasAgrupadas.map((a, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors font-bold text-slate-700">
                      <td className="px-8 py-4 uppercase font-black text-slate-900">{a.periodo}</td>
                      <td className="px-8 py-4 text-center font-mono"><span className="bg-slate-100 px-3 py-1 rounded-xl text-[10px]">{a.transacciones} facturas</span></td>
                      <td className="px-8 py-4 text-right font-black text-emerald-600">RD$ {a.total.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECCIÓN RANKING DE CLIENTES (PERMANECE IGUAL, MEJORADO CON EL ESTILO SLATE) */}
      {tabActiva === 'clientes' && puedeVerClientes && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm">
              <div className="w-16 h-16 bg-slate-900/5 rounded-3xl flex items-center justify-center text-slate-900"><Users size={32} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase italic">Clientes Concurrentes</p>
                <h3 className="text-3xl font-black text-slate-800 italic">{reporteClientes.length} Compradores</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600"><TrendingUp size={32} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase italic">Mayor Impacto Comercial</p>
                <h3 className="text-2xl font-black text-slate-800 italic uppercase truncate max-w-[220px]">
                  {reporteClientes[0]?.nombre || "---"}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-slate-400 text-[9px] uppercase font-black tracking-widest">
                  <th className="px-8 py-5">Nombre Completo</th>
                  <th className="px-8 py-5 text-center">Frecuencia</th>
                  <th className="px-8 py-5 text-right">Inversión Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reporteClientes.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-black text-slate-700 uppercase flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">{idx + 1}</div>
                      {c.nombre}
                    </td>
                    <td className="px-8 py-4 text-center"><span className="bg-slate-900 text-white px-3 py-1 rounded-lg font-black">{c.visitas} vtas</span></td>
                    <td className="px-8 py-4 text-right font-black text-slate-900">RD$ {c.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER DE LA SECCIÓN DE AUDITORÍA */}
      {tabActiva === 'auditoria' && puedeVerAuditoria && (
        <AuditoriaIngresosSection permisos={permisos.subModulos?.auditoria_ingresos} auditorias={auditorias} />
      )}
    </div>
  );
};

export default Reportes;