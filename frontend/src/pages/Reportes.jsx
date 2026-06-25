import React, { useState, useMemo } from 'react';
import { useVentas } from '../context/VentasContext';
import { 
  Search, Calendar, FileText, Table, DollarSign, 
  Hash, Users, Star, Package, TrendingUp, BarChart2
} from 'lucide-react';

// IMPORTAR LIBRERÍAS DE EXPORTACIÓN Y DATEPICKER
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reportes = () => {
  const { historialVentas } = useVentas();
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [busquedaGlobal, setBusquedaGlobal] = useState(""); 
  const [tabActiva, setTabActiva] = useState('ventas'); // 'ventas' o 'clientes'
  
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
    } else {
      data = reporteClientes.map(c => ({ 
        'Cliente': c.nombre, 
        'Facturas Emitidas': c.visitas, 
        'Inversión Total (RD$)': Number(c.total || 0) // 🌟 CORRECCIÓN 5
      }));
      nombreArchivo = "Ranking_Clientes";
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Comercial");
    
    ws['!cols'] = maxProps = Object.keys(data[0] || {}).map(() => ({ wch: 22 }));

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-2 animate-in fade-in duration-500">
      
      {/* PANEL DE CONTROL SUPERIOR */}
      <header className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-none">
              {tabActiva === 'ventas' ? 'Auditoría de Ingresos' : 'Lealtad y Cartera'}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">
              Dashboard de Control Comercial
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
            <button onClick={() => setTabActiva('ventas')} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tabActiva === 'ventas' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Ventas Generales</button>
            <button onClick={() => setTabActiva('clientes')} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tabActiva === 'clientes' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Ranking de Clientes</button>
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
      {tabActiva === 'ventas' && (
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
      {tabActiva === 'clientes' && (
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
    </div>
  );
};

export default Reportes;