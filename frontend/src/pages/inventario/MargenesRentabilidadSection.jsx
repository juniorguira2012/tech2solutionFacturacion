import React, { useEffect, useState } from 'react';
import { AlertCircle, Download, FileSpreadsheet, FileText, Search, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axiosClient from '../../api/axiosClient';

const PAGE_SIZE = 20;
const EXPORT_PAGE_SIZE = 50;
const currencyFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  maximumFractionDigits: 2,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
const formatPercent = (value) => (
  value == null ? 'N/D' : `${Number(value).toFixed(2)}%`
);

const getExportRows = (products) => products.map((product) => ({
  'Producto': product.nombre,
  'Código': product.codigo || '',
  'Categoría': product.categoria || '',
  'Costo de compra': product.costoCompra > 0 ? Number(product.costoCompra) : '',
  'Precio de venta': Number(product.precio) || 0,
  'Utilidad unitaria': product.utilidadUnitaria == null ? '' : Number(product.utilidadUnitaria),
  'Margen (%)': product.margenPorcentaje == null ? '' : Number(product.margenPorcentaje),
  'Stock': Number(product.stock) || 0,
  'Utilidad potencial': product.utilidadPotencial == null ? '' : Number(product.utilidadPotencial),
}));

const MargenesRentabilidadSection = () => {
  const [report, setReport] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    axiosClient.get('/products/profitability', {
      params: { page, limit: PAGE_SIZE, search: search.trim() || undefined },
      signal: controller.signal,
    })
      .then(({ data }) => setReport(data))
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        const message = requestError.response?.data?.message || requestError.message;
        setError(message || 'No se pudo cargar el reporte de rentabilidad.');
        console.error('Error al cargar márgenes y rentabilidad:', message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, search]);

  const summary = report?.summary;
  const cargarProductosParaExportar = async () => {
    const params = { page: 1, limit: EXPORT_PAGE_SIZE, search: search.trim() || undefined };
    const { data: firstPage } = await axiosClient.get('/products/profitability', { params });
    const remainingPages = Array.from(
      { length: Math.max((firstPage.meta?.lastPage ?? 1) - 1, 0) },
      (_, index) => index + 2,
    );
    const otherPages = [];
    for (let index = 0; index < remainingPages.length; index += 5) {
      const pageBatch = remainingPages.slice(index, index + 5);
      const results = await Promise.all(pageBatch.map(async (currentPage) => {
        const { data } = await axiosClient.get('/products/profitability', {
          params: { ...params, page: currentPage },
        });
        return data.data || [];
      }));
      otherPages.push(...results);
    }

    return {
      summary: firstPage.summary,
      products: [...(firstPage.data || []), ...otherPages.flat()],
    };
  };

  const exportarExcel = async () => {
    setExporting('excel');
    setExportError('');
    try {
      const { summary: totals, products } = await cargarProductosParaExportar();
      const workbook = XLSX.utils.book_new();
      const summaryRows = [
        { Indicador: 'Productos activos', Valor: totals.totalProducts },
        { Indicador: 'Productos con costo registrado', Valor: totals.productsWithCost },
        { Indicador: 'Productos sin costo registrado', Valor: totals.productsWithoutCost },
        { Indicador: 'Unidades en inventario', Valor: totals.totalStock },
        { Indicador: 'Valor del inventario a costo (DOP)', Valor: totals.inventoryCostValue },
        { Indicador: 'Valor potencial a precio de venta (DOP)', Valor: totals.inventorySaleValue },
        { Indicador: 'Utilidad bruta potencial (DOP)', Valor: totals.potentialProfit },
        { Indicador: 'Margen ponderado (%)', Valor: totals.marginPercentage },
        { Indicador: 'Productos en detalle exportado', Valor: products.length },
        { Indicador: 'Búsqueda aplicada', Valor: search.trim() || 'Ninguna' },
        { Indicador: 'Fecha de generación', Valor: new Date().toLocaleString('es-DO') },
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
      summarySheet['!cols'] = [{ wch: 48 }, { wch: 30 }];
      const productSheet = XLSX.utils.json_to_sheet(getExportRows(products));
      productSheet['!cols'] = [
        { wch: 32 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 18 },
        { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 22 },
      ];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
      XLSX.utils.book_append_sheet(workbook, productSheet, 'Productos');
      XLSX.writeFile(workbook, `margenes_rentabilidad_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (exportRequestError) {
      const message = exportRequestError.response?.data?.message || exportRequestError.message;
      setExportError(message || 'No se pudo generar el archivo Excel.');
      console.error('Error al exportar márgenes a Excel:', message);
    } finally {
      setExporting('');
    }
  };

  const exportarPdf = async () => {
    setExporting('pdf');
    setExportError('');
    try {
      const { summary: totals, products } = await cargarProductosParaExportar();
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16);
      doc.text('Márgenes y rentabilidad de inventario', 14, 15);
      doc.setFontSize(9);
      doc.text(`Generado: ${new Date().toLocaleString('es-DO')}`, 14, 22);
      doc.text(`Búsqueda: ${search.trim() || 'Todos los productos activos'} · Productos en detalle: ${products.length}`, 14, 28);
      doc.text(
        `Valor a costo: ${formatCurrency(totals.inventoryCostValue)}   |   Utilidad potencial: ${formatCurrency(totals.potentialProfit)}   |   Margen ponderado: ${formatPercent(totals.marginPercentage)}`,
        14,
        35,
      );
      doc.autoTable({
        head: [[
          'Producto',
          'Código',
          'Categoría',
          'Costo compra',
          'Precio venta',
          'Utilidad unitaria',
          'Margen',
          'Stock',
          'Utilidad potencial',
        ]],
        body: products.map((product) => [
          product.nombre,
          product.codigo || '—',
          product.categoria || '—',
          product.costoCompra > 0 ? formatCurrency(product.costoCompra) : 'Sin costo',
          formatCurrency(product.precio),
          product.utilidadUnitaria == null ? 'N/D' : formatCurrency(product.utilidadUnitaria),
          formatPercent(product.margenPorcentaje),
          String(product.stock),
          product.utilidadPotencial == null ? 'N/D' : formatCurrency(product.utilidadPotencial),
        ]),
        startY: 41,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [15, 23, 42] },
        theme: 'striped',
      });
      doc.save(`margenes_rentabilidad_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (exportRequestError) {
      const message = exportRequestError.response?.data?.message || exportRequestError.message;
      setExportError(message || 'No se pudo generar el archivo PDF.');
      console.error('Error al exportar márgenes a PDF:', message);
    } finally {
      setExporting('');
    }
  };

  const metrics = [
    { label: 'Productos activos', value: summary?.totalProducts ?? 0, detail: `${summary?.totalStock ?? 0} unidades en inventario` },
    { label: 'Valor del inventario a costo', value: formatCurrency(summary?.inventoryCostValue), detail: 'Solo productos con costo registrado' },
    { label: 'Utilidad bruta potencial', value: formatCurrency(summary?.potentialProfit), detail: 'Sobre existencias con costo conocido' },
    { label: 'Margen ponderado', value: formatPercent(summary?.marginPercentage), detail: 'Utilidad potencial / venta potencial' },
  ];

  return (
    <section className="space-y-5 animate-in fade-in duration-300">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">Márgenes y rentabilidad</h2>
            <p className="text-xs text-slate-500">Rentabilidad estimada del inventario activo</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar producto, código o categoría"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand"
            />
          </label>
          <button
            type="button"
            onClick={exportarExcel}
            disabled={Boolean(exporting) || loading || Boolean(error)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Descargar reporte Excel"
          >
            {exporting === 'excel' ? <Download size={16} className="animate-bounce" /> : <FileSpreadsheet size={16} />}
            Excel
          </button>
          <button
            type="button"
            onClick={exportarPdf}
            disabled={Boolean(exporting) || loading || Boolean(error)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Descargar reporte PDF"
          >
            {exporting === 'pdf' ? <Download size={16} className="animate-bounce" /> : <FileText size={16} />}
            PDF
          </button>
        </div>
      </header>

      {summary?.productsWithoutCost > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-xs font-medium">
            {summary.productsWithoutCost} producto(s) activo(s) no tienen costo de compra registrado. No se incluyen en los cálculos de margen y utilidad.
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          No se pudo cargar el reporte: {error}
        </div>
      )}
      {exportError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          No se pudo generar la descarga: {exportError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{metric.label}</p>
            <p className="mt-2 text-xl font-black text-slate-800">{metric.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{metric.detail}</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Rentabilidad por producto</h3>
            <p className="mt-1 text-[11px] text-slate-400">{report?.meta?.total ?? 0} productos activos</p>
          </div>
          {loading && <span className="text-xs font-semibold text-slate-400">Cargando...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Producto</th>
                <th className="px-4 py-3 text-right">Costo compra</th>
                <th className="px-4 py-3 text-right">Precio venta</th>
                <th className="px-4 py-3 text-right">Utilidad unitaria</th>
                <th className="px-4 py-3 text-right">Margen</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-5 py-3 text-right">Utilidad potencial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report?.data?.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3">
                    <p className="font-bold text-slate-800">{product.nombre}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{product.codigo || 'Sin código'} · {product.categoria || 'Sin categoría'}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-600">
                    {product.costoCompra > 0 ? formatCurrency(product.costoCompra) : 'Sin costo'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-600">{formatCurrency(product.precio)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${product.utilidadUnitaria < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {product.utilidadUnitaria == null ? 'N/D' : formatCurrency(product.utilidadUnitaria)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-700">{formatPercent(product.margenPorcentaje)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{product.stock}</td>
                  <td className={`px-5 py-3 text-right font-black ${product.utilidadPotencial < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {product.utilidadPotencial == null ? 'N/D' : formatCurrency(product.utilidadPotencial)}
                  </td>
                </tr>
              ))}
              {!loading && !error && report?.data?.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-sm text-slate-400">
                    No se encontraron productos activos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <span className="text-[11px] text-slate-500">
            Página {report?.meta?.page ?? page} de {report?.meta?.lastPage ?? 1}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(report?.meta?.lastPage ?? 1, current + 1))}
              disabled={loading || page >= (report?.meta?.lastPage ?? 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default MargenesRentabilidadSection;
