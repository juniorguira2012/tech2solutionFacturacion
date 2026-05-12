import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export default function RevisionVariaciones({ conteoId, onPublish, onCancel }) {
  const [conteo, setConteo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [publicado, setPublicado] = useState(false);

  useEffect(() => {
    cargarConteo();
  }, [conteoId]);

  const cargarConteo = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/inventory-counts/${conteoId}`);
      if (!response.ok) throw new Error('Error al cargar el conteo');
      const data = await response.json();
      setConteo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularDiferencia = (item) => {
    return (item.cantidadContada || 0) - (item.cantidadSistema || 0);
  };

  const calcularCostoVariacion = (item) => {
    const diferencia = calcularDiferencia(item);
    const precioUnitario = item.precioUnitario || 0;
    return Math.abs(diferencia) * precioUnitario;
  };

  const calcularResumen = () => {
    if (!conteo?.items) {
      return {
        totalProductos: 0,
        productosConVariacion: 0,
        totalVariacion: 0,
        sobreEstimados: 0,
        subEstimados: 0
      };
    }

    const items = conteo.items;
    let totalVariacion = 0;
    let productosConVariacion = 0;
    let sobreEstimados = 0;
    let subEstimados = 0;

    items.forEach(item => {
      const diferencia = calcularDiferencia(item);
      if (diferencia !== 0) {
        productosConVariacion++;
        totalVariacion += calcularCostoVariacion(item);
        if (diferencia > 0) {
          sobreEstimados++;
        } else {
          subEstimados++;
        }
      }
    });

    return {
      totalProductos: items.length,
      productosConVariacion,
      totalVariacion,
      sobreEstimados,
      subEstimados
    };
  };

  const handlePublicar = async () => {
    try {
      setPublicando(true);
      setError('');
      const response = await fetch(`/inventory-counts/${conteoId}/publish`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Error al publicar ajustes');
      setPublicado(true);
      setTimeout(() => {
        onPublish?.();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setPublicando(false);
    }
  };

  const getEstadoClase = (diferencia) => {
    if (diferencia > 0) return 'bg-green-50';
    if (diferencia < 0) return 'bg-red-50';
    return 'bg-gray-50';
  };

  const getEstadoIcono = (diferencia) => {
    if (diferencia > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    if (diferencia < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <span className="text-gray-400">=</span>;
  };

  const resumen = calcularResumen();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (publicado) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-green-50 rounded-lg">
        <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
        <p className="text-2xl font-bold text-green-700 mb-2">✓ Ajustes publicados</p>
        <p className="text-green-600">Los cambios han sido registrados en el sistema</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Revision de Variaciones</h2>
        <p className="text-gray-600 mt-2">Paso 3: Revisa y publica los ajustes del conteo físico</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tabla de Variaciones */}
      <div className="overflow-x-auto bg-white rounded-lg shadow mb-6">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Código</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Sistema</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Contada</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Diferencia</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">P. Unitario</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Costo Variación</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {conteo?.items?.map((item) => {
              const diferencia = calcularDiferencia(item);
              const costoVariacion = calcularCostoVariacion(item);
              const rowClass = getEstadoClase(diferencia);

              return (
                <tr key={item.id} className={`${rowClass} hover:opacity-80 transition`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nombreProducto}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.codigoProducto}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">{item.cantidadSistema}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">{item.cantidadContada}</td>
                  <td className="px-6 py-4 text-sm text-center font-semibold">
                    {diferencia > 0 ? '+' : ''}{diferencia}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    ${(item.precioUnitario || 0).toLocaleString('es-CO', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold">
                    ${costoVariacion.toLocaleString('es-CO', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getEstadoIcono(diferencia)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600">Total Productos</p>
          <p className="text-2xl font-bold text-blue-700">{resumen.totalProductos}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-gray-600">Con Variación</p>
          <p className="text-2xl font-bold text-purple-700">{resumen.productosConVariacion}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-gray-600">Total Variación</p>
          <p className="text-2xl font-bold text-orange-700">
            ${resumen.totalVariacion.toLocaleString('es-CO', { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600">Sobre-estimados</p>
          <p className="text-2xl font-bold text-green-700">{resumen.sobreEstimados}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-gray-600">Sub-estimados</p>
          <p className="text-2xl font-bold text-red-700">{resumen.subEstimados}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          disabled={publicando}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </button>
        <button
          onClick={handlePublicar}
          disabled={publicando || !!error}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {publicando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Publicando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Publicar Ajustes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
