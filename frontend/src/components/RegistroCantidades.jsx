import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

export default function RegistroCantidades({ conteoId, onCompleted, onCancel }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [itemsEditando, setItemsEditando] = useState({});
  const [guardando, setGuardando] = useState({});

  useEffect(() => {
    cargarProductos();
  }, [conteoId]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/inventory-counts/${conteoId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }

      const data = await response.json();
      const productosConItems = data.items || [];
      setProductos(productosConItems);

      // Inicializar valores editables con cantidades contadas existentes
      const valoresIniciales = {};
      productosConItems.forEach(item => {
        valoresIniciales[item.id] = item.cantidadContada || '';
      });
      setItemsEditando(valoresIniciales);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCantidadChange = (itemId, valor) => {
    setItemsEditando(prev => ({
      ...prev,
      [itemId]: valor
    }));
  };

  const validarCantidad = (valor) => {
    if (valor === '' || valor === null) return false;
    const num = parseFloat(valor);
    return !isNaN(num) && num >= 0;
  };

  const guardarCantidad = async (itemId, producto) => {
    const cantidad = itemsEditando[itemId];

    if (!validarCantidad(cantidad)) {
      setError(`Ingresa una cantidad válida (≥ 0) para ${producto.nombre}`);
      return;
    }

    try {
      setGuardando(prev => ({ ...prev, [itemId]: true }));
      setError('');

      const response = await fetch(
        `/inventory-counts/${conteoId}/items/${itemId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cantidadContada: parseFloat(cantidad) })
        }
      );

      if (!response.ok) {
        throw new Error('Error al guardar la cantidad');
      }

      // Actualizar el estado local
      setProductos(prev =>
        prev.map(p =>
          p.id === itemId ? { ...p, cantidadContada: parseFloat(cantidad) } : p
        )
      );
    } catch (err) {
      setError(err.message || 'Error al guardar');
      console.error('Error:', err);
    } finally {
      setGuardando(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const productosContados = productos.filter(p => p.cantidadContada !== null && p.cantidadContada !== undefined).length;
  const totalProductos = productos.length;
  const todosContados = productosContados === totalProductos && totalProductos > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Paso 2: Registro de Cantidades
        </h2>
        <p className="text-gray-600">
          Ingresa la cantidad contada para cada producto
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Progreso</p>
          <p className="text-sm font-bold text-blue-600">
            {productosContados}/{totalProductos} productos contados
          </p>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalProductos > 0 ? (productosContados / totalProductos) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Tabla de Productos */}
      {totalProductos === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No hay productos para contar</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Stock Sistema</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Cantidad Contada</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Unidad</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, idx) => {
                const cantidadActual = itemsEditando[producto.id];
                const esValida = validarCantidad(cantidadActual) || cantidadActual === '';
                const yaGuardada = producto.cantidadContada !== null && producto.cantidadContada !== undefined;
                
                return (
                  <tr key={producto.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {producto.codigo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{producto.nombre}</div>
                      {yaGuardada && (
                        <div className="text-xs text-green-600 font-semibold">✓ Guardado</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 font-medium">
                      {producto.cantidadSistema}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={cantidadActual}
                          onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
                          className={`w-20 px-2 py-1 text-center border rounded ${
                            esValida
                              ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                              : 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          }`}
                          placeholder="0"
                          disabled={guardando[producto.id]}
                        />
                      </div>
                      {!esValida && cantidadActual !== '' && (
                        <p className="text-xs text-red-600 mt-1">Inválido</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {producto.unidadMedida}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => guardarCantidad(producto.id, producto)}
                        disabled={!esValida || cantidadActual === '' || guardando[producto.id]}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded font-medium transition-colors ${
                          !esValida || cantidadActual === '' || guardando[producto.id]
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {guardando[producto.id] ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Guardando...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">Guardar</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-8 gap-4">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Atrás</span>
        </button>

        <div className="text-center">
          {!todosContados && (
            <p className="text-sm text-gray-600">
              Completa el registro de todos los productos para continuar
            </p>
          )}
        </div>

        <button
          onClick={onCompleted}
          disabled={!todosContados}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            todosContados
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Siguiente</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
