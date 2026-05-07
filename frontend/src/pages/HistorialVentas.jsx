import React, { useState } from 'react';
import { Printer, Search, Calendar, FileText } from 'lucide-react';
import { useVentas } from '../context/VentasContext';
import { imprimirTicket } from '../utils/printer';

const HistorialVentas = () => {
  const { historialVentas } = useVentas();
  const [filtro, setFiltro] = useState("");

  const reimprimir = (venta) => {
    // Usamos los items guardados en la venta para el ticket
    if (venta.items) {
      imprimirTicket(venta, venta.items);
    } else {
      alert("No hay detalles disponibles para esta factura antigua.");
    }
  };

  const ventasFiltradas = historialVentas.filter(v => {
  const nombreCliente = v.cliente ? v.cliente.toLowerCase() : "";
  const idVenta = v.id ? v.id.toString() : "";
  const busqueda = filtro.toLowerCase();
  
  return nombreCliente.includes(busqueda) || idVenta.includes(busqueda);
 });
 
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 font-sans">Historial de Ventas</h1>
        <p className="text-slate-500">Consulta y reimprime facturas emitidas.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente o ID..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-brand outline-none"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">ID / Fecha</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4 text-center">Artículos</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ventasFiltradas.map((venta) => (
              <tr key={venta.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-mono text-xs font-bold text-brand">#ORD-{venta.id.toString().slice(-6)}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> {venta.fecha}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">{venta.cliente}</td>
                <td className="px-6 py-4 text-center text-slate-600">{venta.articulos}</td>
                <td className="px-6 py-4 text-right font-black text-slate-800">RD$ {venta.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => reimprimir(venta)}
                    className="p-2 text-brand hover:bg-indigo-50 rounded-lg flex items-center gap-2 ml-auto"
                  >
                    <Printer size={18} />
                    <span className="text-xs font-bold">Reimprimir</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {ventasFiltradas.length === 0 && (
          <div className="p-20 text-center text-slate-400">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p>No se encontraron facturas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialVentas;