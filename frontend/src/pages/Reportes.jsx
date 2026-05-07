import React, { useState, useMemo } from 'react';
import { useVentas } from '../context/VentasContext';
import { 
  Search, Calendar, X, DollarSign, FileText, Table, 
  ShoppingBag, Hash, Users, Star, Package, TrendingUp
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
  const [tabActiva, setTabActiva] = useState('ventas');

  // 1. FILTRADO MAESTRO (Fecha + Buscador)
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

  // 2. CÁLCULOS AVANZADOS (KPIs)
  const statsVentas = useMemo(() => {
    let totalDinero = 0;
    let totalProductosCant = 0;
    const conteoProductos = {};

    ventasFiltradas.forEach(venta => {
      totalDinero += venta.total;
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

  const reporteClientes = useMemo(() => {
    const clientesMap = ventasFiltradas.reduce((acc, v) => {
      const nombre = v.cliente || "Consumidor Final";
      if (!acc[nombre]) acc[nombre] = { nombre, total: 0, visitas: 0 };
      acc[nombre].total += v.total;
      acc[nombre].visitas += 1;
      return acc;
    }, {});
    return Object.values(clientesMap).sort((a, b) => b.total - a.total);
  }, [ventasFiltradas]);

  // 3. FUNCIONES DE EXPORTACIÓN REINSTALADAS
  const exportarExcel = () => {
    const data = tabActiva === 'ventas' 
      ? ventasFiltradas.map(v => ({ Ref: v.id, Fecha: v.fecha.split('T')[0], Cajero: v.vendedorNombre || 'Admin', Cliente: v.cliente, Total: v.total }))
      : reporteClientes.map(c => ({ Cliente: c.nombre, Facturas: c.visitas, Inversión: c.total }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `Reporte_${tabActiva}_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`REPORTE DE ${tabActiva.toUpperCase()}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Rango: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 14, 28);

    const headers = tabActiva === 'ventas' 
      ? [["REF", "FECHA", "CAJERO", "CLIENTE", "TOTAL"]]
      : [["CLIENTE", "FACTURAS", "INVERSIÓN TOTAL"]];

    const rows = tabActiva === 'ventas'
      ? ventasFiltradas.map(v => [v.id.toString().slice(-6), v.fecha.split('T')[0], v.vendedorNombre || 'Admin', v.cliente, `RD$ ${v.total.toLocaleString()}`])
      : reporteClientes.map(c => [c.nombre, c.visitas, `RD$ ${c.total.toLocaleString()}`]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 35,
      headStyles: { fillColor: [79, 70, 229] },
      theme: 'grid'
    });
    doc.save(`Reporte_${tabActiva}_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-2 animate-in fade-in duration-500">
      
      <header className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-none">
              {tabActiva === 'ventas' ? 'Análisis Comercial' : 'Lealtad de Clientes'}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">
              Dashboard Administrativo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* BOTONES DE EXPORTACIÓN REINSTALADOS */}
            <div className="flex gap-2 mr-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button onClick={exportarPDF} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Exportar PDF">
                <FileText size={18} />
              </button>
              <button onClick={exportarExcel} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Exportar Excel">
                <Table size={18} />
              </button>
            </div>

            {/* BUSCADOR */}
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-brand transition-all">
              <Search size={14} className="text-slate-400" />
              <input 
                type="text" 
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
                placeholder="Buscar..."
                className="outline-none text-slate-700 font-black text-[11px] uppercase w-40 bg-transparent"
              />
            </div>

            {/* CALENDARIO */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <Calendar size={14} className="text-brand" />
              <DatePicker
                selectsRange startDate={startDate} endDate={endDate}
                onChange={(update) => { setStartDate(update[0]); setEndDate(update[1]); }}
                className="outline-none font-black text-[10px] uppercase text-slate-600 cursor-pointer w-36" 
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-3 border-t border-slate-50 pt-4">
          <button onClick={() => setTabActiva('ventas')} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tabActiva === 'ventas' ? 'bg-brand text-white shadow-xl shadow-indigo-200 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Ventas Totales</button>
          <button onClick={() => setTabActiva('clientes')} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tabActiva === 'clientes' ? 'bg-brand text-white shadow-xl shadow-indigo-200 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Ranking Clientes</button>
        </div>
      </header>

      {/* CONTENIDO DE VENTAS */}
      {tabActiva === 'ventas' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-brand p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
              <DollarSign className="absolute -right-2 -top-2 opacity-10" size={80} />
              <p className="text-[10px] font-black uppercase opacity-60 italic">Recaudación</p>
              <h3 className="text-2xl font-black italic mt-1">RD$ {statsVentas.total.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <Hash className="absolute right-4 top-4 text-slate-100" size={30} />
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Facturas</p>
              <h3 className="text-2xl font-black text-slate-800 italic mt-1">{statsVentas.facturas}</h3>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <Package className="absolute right-4 top-4 text-slate-100" size={30} />
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Items Vendidos</p>
              <h3 className="text-2xl font-black text-slate-800 italic mt-1">{statsVentas.unidades} uds</h3>
            </div>
            <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <Star className="absolute right-4 top-4 opacity-20" size={30} />
              <p className="text-[10px] font-black uppercase opacity-70 italic">Top Producto</p>
              <h3 className="text-sm font-black uppercase truncate mt-1 leading-tight" title={statsVentas.productoEstrella}>
                {statsVentas.productoEstrella}
              </h3>
              <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full mt-2 inline-block">
                {statsVentas.cantEstrella} vendidos
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-slate-400 text-[9px] uppercase font-black tracking-widest">
                  <th className="px-8 py-5 text-brand italic">Ref</th>
                  <th className="px-8 py-5">Cajero</th>
                  <th className="px-8 py-5">Cliente</th>
                  <th className="px-8 py-5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ventasFiltradas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-4 font-mono font-bold text-slate-400">#{v.id.toString().slice(-6)}</td>
                    <td className="px-8 py-4 font-black text-slate-600 uppercase">{v.vendedorNombre || "Admin"}</td>
                    <td className="px-8 py-4 font-bold text-slate-800 uppercase">{v.cliente || "Consumidor Final"}</td>
                    <td className="px-8 py-4 text-right font-black text-slate-900">RD$ {v.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA DE CLIENTES */}
      {tabActiva === 'clientes' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm">
              <div className="w-16 h-16 bg-brand/10 rounded-3xl flex items-center justify-center text-brand"><Users size={32} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase italic">Cartera Activa</p>
                <h3 className="text-3xl font-black text-slate-800 italic">{reporteClientes.length} Clientes</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600"><TrendingUp size={32} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase italic">Líder de Compras</p>
                <h3 className="text-2xl font-black text-slate-800 italic uppercase truncate max-w-[200px]">
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
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-8 py-4 font-black text-slate-700 uppercase flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">{idx + 1}</div>
                      {c.nombre}
                    </td>
                    <td className="px-8 py-4 text-center"><span className="bg-indigo-100 text-brand px-3 py-1 rounded-lg font-black">{c.visitas} vtas</span></td>
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