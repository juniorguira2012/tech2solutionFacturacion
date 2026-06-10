import { useState } from 'react';

export const useMovimientosForm = (
  productos, registrarMovimiento, registrarTransferencia, registrarMovimientosMasivos, 
  recargarInventario, cerrarModal, mostrarToast, usuario, tipoMovimiento
) => {
  // 1. Estado para los movimientos simples (Descartar, Devolución por producto, etc.)
  const [movimientoData, setMovimientoData] = useState({
    productoId: '',
    cantidad: 1,
    almacenDestino: 'Principal',
    nota: '',
    lote: ''
  });

  // 2. Estados independientes para el formulario de transferencia
  const [transferProductoId, setTransferProductoId] = useState('');
  const [almacenOrigen, setAlmacenOrigen] = useState('');
  const [almacenDestino, setAlmacenDestino] = useState('');
  const [transferCantidad, setTransferCantidad] = useState('');
  const [transferNota, setTransferNota] = useState('');

  // 3. NUEVO: Estados independientes para el formulario de AJUSTE
  const [ajusteProductoId, setAjusteProductoId] = useState('');
  const [ajusteCantidad, setAjusteCantidad] = useState('');
  const [ajusteCosto, setAjusteCosto] = useState('');
  const [ajusteNota, setAjusteNota] = useState('');
  const [ajusteAlmacen, setAjusteAlmacen] = useState(''); // Almacén específico a afectar

  const ejecutarMovimiento = async (e) => {
    e.preventDefault();
    let payload = {};

    // =========================================================================
    // FLUJO A: TRANSFERENCIA
    // =========================================================================
    if (tipoMovimiento === 'transferir') {
      const prod = productos.find(p => p.id === Number(transferProductoId));
      if (!prod) return mostrarToast?.('Selecciona un producto válido', 'error');
      if (!almacenOrigen) return mostrarToast?.('Selecciona un almacén de origen', 'error');
      if (!almacenDestino) return mostrarToast?.('Selecciona un almacén de destino', 'error');
      if (almacenOrigen === almacenDestino) {
        return mostrarToast?.('El almacén de origen y destino no pueden ser el mismo', 'error');
      }
      if (Number(transferCantidad) <= 0) return mostrarToast?.('La cantidad debe ser mayor a 0', 'error');
      if (prod.stock < Number(transferCantidad)) {
        return mostrarToast?.(`Stock insuficiente en ${almacenOrigen}. Disponible: ${prod.stock}`, 'error');
      }

      payload = {
        productoId: Number(prod.id),
        tipo: 'TRANSFERIR',
        cantidad: Number(transferCantidad),
        nota: String(transferNota || 'Transferencia de inventario regular'),
        usuarioId: usuario?.id ? String(usuario.id) : undefined,
        almacenOrigen: String(almacenOrigen),
        almacenDestino: String(almacenDestino)
      };

    // =========================================================================
    // FLUJO B: NUEVO - AJUSTE DE INVENTARIO CON COSTO
    // =========================================================================
    } else if (tipoMovimiento === 'ajustar' || tipoMovimiento === 'ajuste') {
      const prod = productos.find(p => p.id === Number(ajusteProductoId));
      if (!prod) return mostrarToast?.('Selecciona un producto válido', 'error');
      if (!ajusteAlmacen) return mostrarToast?.('Selecciona el almacén a afectar', 'error');
      if (Number(ajusteCantidad) < 0) return mostrarToast?.('La cantidad física real no puede ser negativa', 'error');
      if (Number(ajusteCosto) < 0) return mostrarToast?.('El costo unitario no puede ser menor a 0', 'error');

      payload = {
        productoId: Number(prod.id),
        tipo: 'AJUSTE',
        cantidad: Number(ajusteCantidad), // Este valor sustituirá el stock según tu backend
        costoUnitario: Number(ajusteCosto), // Pasamos el nuevo costo
        almacenDestino: String(ajusteAlmacen), // Mapeamos el almacén afectado aquí
        nota: String(ajusteNota || 'Ajuste manual de inventario'),
        usuarioId: usuario?.id ? String(usuario.id) : undefined
      };

    // =========================================================================
    // FLUJO C: MOVIMIENTOS SIMPLES (Entradas directas, descartes o salidas ordinarias)
    // =========================================================================
    } else {
      const prod = productos.find(p => p.id === Number(movimientoData.productoId));
      if (!prod) return mostrarToast?.('Selecciona un producto válido', 'error');

      payload = {
        productoId: Number(prod.id),
        tipo: tipoMovimiento.toUpperCase(),
        cantidad: Number(movimientoData.cantidad),
        lote: movimientoData.lote,
        almacenDestino: String(movimientoData.almacenDestino), 
        nota: String(movimientoData.nota || ''),
        usuarioId: usuario?.id ? String(usuario.id) : undefined
      };
    }

    try {
      const exito = await registrarMovimiento(payload);
      if (exito) {
        mostrarToast?.(`Movimiento de ${tipoMovimiento} completado con éxito`, 'success');
        cerrarModal();
        recargarInventario();
      }
    } catch (error) {
      console.error("Error en movimiento:", error);
      mostrarToast?.(error.message || "No se pudo completar la operación", "error");
    }
  };

  // Retornamos todo de forma limpia para usar el esparcimiento `{...formProps}`
  return {
    movimientoData,
    setMovimientoData,
    transferProductoId,
    setTransferProductoId,
    almacenOrigen,
    setAlmacenOrigen,
    almacenDestino,
    setAlmacenDestino,
    transferCantidad,
    setTransferCantidad,
    transferNota,
    setTransferNota,
    
    // Exportamos las variables del ajuste para el FormAjuste
    ajusteProductoId,
    setAjusteProductoId,
    ajusteCantidad,
    setAjusteCantidad,
    ajusteCosto,
    setAjusteCosto,
    ajusteNota,
    setAjusteNota,
    ajusteAlmacen,
    setAjusteAlmacen,
    
    ejecutarMovimiento
  };
};