import React, { useState, useEffect } from 'react';
import { ListCheck, AlertCircle, CheckCircle2, Clock, X, Play, ChevronRight } from 'lucide-react';
import RegistroCantidades from './RegistroCantidades';
import RevisionVariaciones from './RevisionVariaciones';

const ContteoFisico = () => {
  const [conteos, setConteos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  
  // Control del flujo paso a paso
  const [paso, setPaso] = useState(0);
  const [conteoActual, setConteoActual] = useState(null);
  const [creandoConteo, setCreandoConteo] = useState(false);

  useEffect(() => {
    cargarConteos();
    cargarAlmacenes();
  }, []);

  const cargarConteos = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/inventory-counts');
      if (!response.ok) throw new Error('Error al cargar conteos');
      const data = await response.json();
      setConteos(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los conteos');
      setConteos([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarAlmacenes = async () => {
    try {
      const response = await fetch('http://localhost:3000/products');
      if (!response.ok) return;
      const productos = await response.json();
      const almacenesUnicos = [...new Set(productos.map(p => p.almacen || 'Principal'))];
      setAlmacenes(almacenesUnicos.map(a => ({ id: a, nombre: a })));
      if (almacenesUnicos.length > 0) {
        setAlmacenSeleccionado(almacenesUnicos[0]);
      }
    } catch (err) {
      console.error('Error al cargar almacenes:', err);
    }
  };

  const iniciarConteo = async () => {
    if (!almacenSeleccionado) {
      setError('Selecciona un almacén');
      return;
    }
    
    setCreandoConteo(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/inventory-counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'x-inventory-permission': 'full'
        },
        body: JSON.stringify({ almacen: almacenSeleccionado })
      });
      
      if (!response.ok) throw new Error('Error al crear conteo');
      const nuevoConteo = await response.json();
      setConteoActual(nuevoConteo);
      setPaso(2);
    } catch (err) {
      setError(err.message || 'Error al crear conteo');
    } finally {
      setCreandoConteo(false);
    }
  };

  const volverALista = () => {
    setPaso(0);
    setConteoActual(null);
    cargarConteos();
  };

  const irAPaso3 = () => {
    setPaso(3);
  };

  const onConteoPublicado = () => {
    volverALista();
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'En Progreso': return 'bg-blue-100 text-blue-700';
      case 'Contado': return 'bg-yellow-100 text-yellow-700';
      case 'Ajustes Publicados': return 'bg-green-100 text-green-700';
      case 'Cancelado': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getIconoEstado = (estado) => {
    switch (estado) {
      case 'En Progreso': return <Clock size={16} />;
      case 'Contado': return <CheckCircle2 size={16} />;
      case 'Ajustes Publicados': return <CheckCircle2 size={16} />;
      case 'Cancelado': return <X size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  if (paso === 2 && conteoActual) {
    return (
      <RegistroCantidades 
        conteoId={conteoActual.id}
        onCompleted={irAPaso3}
        onCancel={volverALista}
      />
    );
  }

  if (paso === 3 && conteoActual) {
    return (
      <RevisionVariaciones 
        conteoId={conteoActual.id}
        onPublish={onConteoPublicado}
        onCancel={volverALista}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <ListCheck size={40} className="text-blue-600" />
            Conteo Físico de Inventario
          </h1>
          <p className="text-gray-600">Realiza conteos físicos de tus almacenes y ajusta automáticamente el stock</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Play size={24} className="text-blue-600" />
            Iniciar Nuevo Conteo
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona el Almacén
              </label>
              <select
                value={almacenSeleccionado}
                onChange={(e) => setAlmacenSeleccionado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Seleccionar --</option>
                {almacenes.map((alm) => (
                  <option key={alm.id} value={alm.id}>
                    {alm.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={iniciarConteo}
              disabled={creandoConteo || !almacenSeleccionado}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2 mt-6 sm:mt-0"
            >
              {creandoConteo ? 'Creando...' : 'Iniciar Conteo'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Conteos Realizados</h2>
          </div>

          {cargando ? (
            <div className="p-8 text-center text-gray-500">Cargando conteos...</div>
          ) : conteos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay conteos. ¡Crea uno usando el formulario arriba!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Almacén</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Productos</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Variación ($)</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {conteos.map((conteo) => (
                    <tr key={conteo.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{conteo.almacen}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getColorEstado(conteo.estado)}`}>
                          {getIconoEstado(conteo.estado)}
                          {conteo.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-800">{conteo.totalProductos}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-800">
                        ${Number(conteo.totalVariacion).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(conteo.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        {conteo.estado === 'En Progreso' && (
                          <button
                            onClick={() => {
                              setConteoActual(conteo);
                              setPaso(2);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Continuar
                          </button>
                        )}
                        {conteo.estado === 'Contado' && (
                          <button
                            onClick={() => {
                              setConteoActual(conteo);
                              setPaso(3);
                            }}
                            className="text-amber-600 hover:text-amber-800 font-semibold"
                          >
                            Revisar
                          </button>
                        )}
                        {conteo.estado !== 'En Progreso' && conteo.estado !== 'Contado' && (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContteoFisico;
