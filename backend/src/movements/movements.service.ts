import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Movement } from './entities/movement.entity';
import { Product } from '../products/entities/product.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { ProductWarehouseStock } from '../products/entities/product-warehouse-stock.entity';
import { InventoryBatch } from './entities/inventory-batch.entity';

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(Movement)
    private movementRepository: Repository<Movement>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  /**
   * Helper para actualizar el stock por almacén de forma atómica usando QueryBuilder puro
   */
  private async updateWarehouseStock(
    manager: EntityManager,
    productoId: number,
    almacen: string,
    cantidad: number,
    isAbsolute: boolean = false,
  ) {
    if (!almacen) return;

    const nombreAlmacen = almacen.trim();
    const idProducto = Number(productoId);
    const cantidadNueva = Number(cantidad);

    const existeStock = await manager.findOne(ProductWarehouseStock, {
      where: { productoId: idProducto, almacen: nombreAlmacen },
    });

    if (!existeStock) {
      const stockInicial = isAbsolute ? cantidadNueva : (cantidadNueva < 0 ? 0 : cantidadNueva);
      
      const nuevoStockEntry = manager.create(ProductWarehouseStock, {
        productoId: idProducto,
        almacen: nombreAlmacen,
        cantidad: stockInicial,
      });
      await manager.save(ProductWarehouseStock, nuevoStockEntry);

    } else {
      const nuevaCantidadCalculada = isAbsolute 
        ? cantidadNueva 
        : Number(existeStock.cantidad) + cantidadNueva;

      await manager.update(ProductWarehouseStock, 
        { productoId: idProducto, almacen: nombreAlmacen },
        { cantidad: nuevaCantidadCalculada }
      );
    }
  }

  /**
   * Registra automáticamente un lote en la base de datos para entradas de inventario
   */
  private async generateAndSaveBatch(
    manager: EntityManager,
    productoId: number,
    cantidad: number,
    almacen: string,
    providedBatchNumber?: string,
  ) {
    const batchNumber = providedBatchNumber || `LOTE-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // +1 año por defecto

    const batchEntry = manager.create(InventoryBatch, {
      productoId: productoId,
      numeroLote: batchNumber,
      cantidad: cantidad,
      almacen: almacen,
      fechaVencimiento: expiryDate,
    });
    await manager.save(InventoryBatch, batchEntry);

    return batchNumber;
  }

  /**
   * PROCESAR TRANSFERENCIA ENTRE ALMACENES (Atómico)
   */
  async transferBulk(transferData: { 
    productoId: number; 
    almacenOrigen: string; 
    almacenDestino: string; 
    cantidad: number; 
    nota: string; 
    usuarioId?: any 
  }) {
    const { productoId, almacenOrigen, almacenDestino, cantidad, nota, usuarioId } = transferData;

    if (almacenOrigen === almacenDestino) {
      throw new BadRequestException('El almacén de origen y destino no pueden ser iguales.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const producto = await queryRunner.manager.findOne(Product, { where: { id: productoId } });
      if (!producto) {
        throw new NotFoundException(`Producto ID ${productoId} no encontrado`);
      }

      const cantidadNumerica = Number(cantidad);

      // CORRECCIÓN: Validar stock directamente en el almacén de origen, no en el global
      const stockOrigen = await queryRunner.manager.findOne(ProductWarehouseStock, {
        where: { productoId: producto.id, almacen: almacenOrigen.trim() }
      });

      const stockDisponibleOrigen = stockOrigen ? Number(stockOrigen.cantidad) : 0;
      if (stockDisponibleOrigen < cantidadNumerica) {
        throw new BadRequestException(
          `Stock insuficiente en ${almacenOrigen} para ${producto.nombre}. Disponible: ${stockDisponibleOrigen}, Requerido: ${cantidadNumerica}`
        );
      }

      // Actualizar stocks específicos por almacén
      await this.updateWarehouseStock(queryRunner.manager, productoId, almacenOrigen, -cantidadNumerica);
      await this.updateWarehouseStock(queryRunner.manager, productoId, almacenDestino, cantidadNumerica);

      // BLINDAJE: Pasamos el objeto 'producto' completo en lugar del id numérico plano
      const logSalida = queryRunner.manager.create(Movement, {
        producto: producto, 
        tipo: 'SALIDA',
        cantidad: cantidadNumerica,
        nuevoStock: producto.stock,
        nota: `TRANSFERENCIA (ORIGEN: ${almacenOrigen} -> DESTINO: ${almacenDestino}) | ${nota}`,
        almacenOrigen: almacenOrigen,
        almacenDestino: almacenDestino,
        usuarioId: usuarioId ? String(usuarioId) : undefined
      });
      await queryRunner.manager.save(Movement, logSalida);

      const logEntrada = queryRunner.manager.create(Movement, {
        producto: producto,
        tipo: 'ENTRADA',
        cantidad: cantidadNumerica,
        nuevoStock: producto.stock,
        nota: `TRANSFERENCIA (RECIBIDO DESDE: ${almacenOrigen}) | ${nota}`,
        almacenOrigen: almacenOrigen,
        almacenDestino: almacenDestino,
        usuarioId: usuarioId ? String(usuarioId) : undefined
      });
      await queryRunner.manager.save(Movement, logEntrada);

      await queryRunner.commitTransaction();
      return { message: 'Transferencia procesada con éxito', productoId, cantidad: cantidadNumerica };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Crear un movimiento individual
   */
 /**
   * Crear un movimiento individual (Corregido y blindado por almacén)
   */
  async create(createMovementDto: CreateMovementDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { productoId, tipo, cantidad, nota, usuarioId, almacenOrigen, almacenDestino, referencia, lote } = createMovementDto as any;

    try {
      let batchGenerated = '';
      const producto = await queryRunner.manager.findOne(Product, { where: { id: productoId } });
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
      }

      const tipoNormalizado = tipo.toUpperCase();
      const cantidadNumerica = Number(cantidad);
      let nuevoStock = producto.stock;
      
      // Determinamos cuál es el almacén objetivo de la operación comercial
      const targetAlmacen = (almacenDestino || almacenOrigen || producto.almacen || 'Principal').trim();

      if (tipoNormalizado === 'TRANSFERIR') {
        if (!almacenOrigen || !almacenDestino) {
          throw new BadRequestException('Para una transferencia se requiere un almacén de origen y uno de destino.');
        }
        
        // CORRECCIÓN EXTRA: Validar stock en origen también en transferencias individuales
        const stockOrigen = await queryRunner.manager.findOne(ProductWarehouseStock, {
          where: { productoId: producto.id, almacen: almacenOrigen.trim() }
        });
        const disponibleOrigen = stockOrigen ? Number(stockOrigen.cantidad) : 0;
        if (disponibleOrigen < cantidadNumerica) {
          throw new BadRequestException(
            `Stock insuficiente en almacén de origen '${almacenOrigen}'. Disponible: ${disponibleOrigen}, Requerido: ${cantidadNumerica}`
          );
        }

        await this.updateWarehouseStock(queryRunner.manager, productoId, almacenOrigen, -cantidadNumerica);
        await this.updateWarehouseStock(queryRunner.manager, productoId, almacenDestino, cantidadNumerica);
        
      } else {
        const tiposIncremento = ['ENTRADA', 'RECIBIR', 'DEVOLUCION_FACTURA'];
        const tiposDecremento = ['SALIDA', 'DESPACHAR', 'DESCARTAR', 'DEVOLUCION']; 

        if (tiposIncremento.includes(tipoNormalizado)) {
          nuevoStock += cantidadNumerica;
          await this.updateWarehouseStock(queryRunner.manager, productoId, targetAlmacen, cantidadNumerica);
          // CREACIÓN AUTOMÁTICA DE LOTE
          batchGenerated = await this.generateAndSaveBatch(queryRunner.manager, productoId, cantidadNumerica, targetAlmacen, lote);

        } else if (tiposDecremento.includes(tipoNormalizado)) {
          // 🚨 BLINDAJE CRÍTICO: Buscar y validar stock real en el almacén específico, no el global
          const stockEnAlmacen = await queryRunner.manager.findOne(ProductWarehouseStock, {
            where: { productoId: producto.id, almacen: targetAlmacen }
          });
          
          const cantidadDisponibleAlmacen = stockEnAlmacen ? Number(stockEnAlmacen.cantidad) : 0;

          if (cantidadDisponibleAlmacen < cantidadNumerica) {
            throw new BadRequestException(
              `Stock insuficiente en el almacén '${targetAlmacen}' para ${producto.nombre}. Disponible: ${cantidadDisponibleAlmacen}, Solicitado: ${cantidadNumerica}`
            );
          }

          nuevoStock -= cantidadNumerica; 
          await this.updateWarehouseStock(queryRunner.manager, productoId, targetAlmacen, -cantidadNumerica);

        } else if (tipoNormalizado === 'AJUSTE' || tipoNormalizado === 'AJUSTAR') {
          if (cantidadNumerica < 0) throw new BadRequestException('El stock no puede ser negativo tras un ajuste');
          
          await this.updateWarehouseStock(queryRunner.manager, productoId, targetAlmacen, cantidadNumerica, true);
          
          const allStocks = await queryRunner.manager.find(ProductWarehouseStock, { where: { productoId: Number(productoId) } });
          nuevoStock = allStocks.reduce((sum, s) => sum + Number(s.cantidad), 0);

          if (createMovementDto.costoUnitario !== undefined && createMovementDto.costoUnitario !== null) {
            producto.precio = Number(createMovementDto.costoUnitario);
          }
          
        } else {
          throw new BadRequestException(`Tipo de movimiento no válido: ${tipo}`);
        }

        producto.stock = nuevoStock;
      }

      // Usamos update en lugar de save para evitar problemas con relaciones eager (Proveedores)
      await queryRunner.manager.update(Product, producto.id, { 
        stock: nuevoStock,
        precio: producto.precio 
      });

      // Se inyecta la instancia 'producto' completa para eliminar el error de Postgres
      const movement = queryRunner.manager.create(Movement, {
        producto: producto, 
        tipo: tipoNormalizado,
        cantidad: cantidadNumerica,
        nuevoStock: Number(nuevoStock),
        nota: batchGenerated ? `${nota || ''} | Lote: ${batchGenerated}` : nota,
        usuarioId: usuarioId ? String(usuarioId) : undefined,
        almacenOrigen: almacenOrigen || targetAlmacen,
        almacenDestino: almacenDestino || targetAlmacen,
        costoUnitario: createMovementDto.costoUnitario ? Number(createMovementDto.costoUnitario) : undefined,
        referencia: referencia || undefined,
      });

      const savedMovement = await queryRunner.manager.save(Movement, movement);

      await queryRunner.commitTransaction();
      return savedMovement;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * PROCESAR RECIBO / DESPACHO MASIVO (Atómico)
   */
  async createBulk(bulkData: { tipo: string; nota: string; items: any[]; usuarioId?: any; referencia?: string }) {
    const { tipo, nota, items, usuarioId, referencia } = bulkData;

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Debe incluir al menos una línea de mercancía');
    }
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const movimientosCreados: Movement[] = [];
      const tipoNormalizado = tipo ? tipo.trim().toUpperCase() : 'RECIBIR';
      const finalUsuarioId = (usuarioId && !isNaN(Number(usuarioId))) ? String(usuarioId) : undefined;
      const tiposIncremento = ['ENTRADA', 'RECIBIR', 'DEVOLUCION_FACTURA'];
      const tiposDecremento = ['SALIDA', 'DESPACHAR', 'DESCARTAR', 'DEVOLUCION'];

      if (!tiposIncremento.includes(tipoNormalizado) && !tiposDecremento.includes(tipoNormalizado)) {
        throw new BadRequestException(`Tipo de movimiento masivo no válido: ${tipo}`);
      }

      for (const [index, item] of items.entries()) {
        const { productoId, cantidad, almacen, lote } = item;
        const idNum = Number(productoId);
        const numeroLinea = index + 1;
        
        if (!productoId || isNaN(idNum)) {
          throw new BadRequestException(`Línea ${numeroLinea}: producto inválido`);
        }
        
        const cantidadNumerica = Number(cantidad);
        if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
          throw new BadRequestException(`Línea ${numeroLinea}: la cantidad debe ser mayor a 0`);
        }

        const almacenNormalizado = String(almacen || 'Principal').trim() || 'Principal';

        const producto = await queryRunner.manager.findOne(Product, { where: { id: idNum } });
        
        if (!producto) {
          throw new NotFoundException(`Producto ID ${productoId} no encontrado en la base de datos`);
        }

        let nuevoStock = producto.stock;
        let batchInfo = '';

        if (tiposIncremento.includes(tipoNormalizado)) {
          nuevoStock += cantidadNumerica;
          await this.updateWarehouseStock(queryRunner.manager, Number(productoId), almacenNormalizado, cantidadNumerica);
          // CREACIÓN AUTOMÁTICA DE LOTE
          batchInfo = await this.generateAndSaveBatch(queryRunner.manager, idNum, cantidadNumerica, almacenNormalizado, lote);
        } 
        else if (tiposDecremento.includes(tipoNormalizado)) {
          if (producto.stock < cantidadNumerica) {
            throw new BadRequestException(
              `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${cantidadNumerica}`
            );
          }
          nuevoStock -= cantidadNumerica;
          await this.updateWarehouseStock(queryRunner.manager, Number(productoId), almacenNormalizado, -cantidadNumerica);
        }

        // Actualización atómica del stock global
        await queryRunner.manager.update(Product, producto.id, { stock: nuevoStock });
        producto.stock = nuevoStock; // Sincronizamos para el log del movimiento

        // BLINDAJE CRÍTICAL: Se pasa la entidad completa 'producto' en vez de sólo el número 'productoId'
        const nuevoMovimiento = queryRunner.manager.create(Movement, {
          producto: producto, 
          tipo: tipoNormalizado,
          cantidad: cantidadNumerica,
          nuevoStock: producto.stock,
          nota: `${nota || ''}${batchInfo ? ` | Lote: ${batchInfo}` : ''} | Almacén: ${almacenNormalizado}`,
          costoUnitario: producto.precio ? Number(producto.precio) : undefined,
          almacenOrigen: almacenNormalizado,
          almacenDestino: almacenNormalizado,
          referencia: referencia ? String(referencia) : undefined,
          usuarioId: finalUsuarioId,
        });

        const guardado = await queryRunner.manager.save(Movement, nuevoMovimiento);
        
        movimientosCreados.push(guardado);
      }

      if (movimientosCreados.length === 0) {
        throw new BadRequestException('No se procesó ninguna línea de mercancía');
      }

      await queryRunner.commitTransaction();
      return { success: true, count: movimientosCreados.length, data: movimientosCreados };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error("Error crítico en Bulk Movement:", err);
      throw new BadRequestException(`No se pudo procesar el movimiento: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.movementRepository.find({
      relations: ['producto'], 
      order: { createdAt: 'DESC' },
    });
  }

  async findByProductId(productoId: number) {
    return await this.movementRepository.find({
      where: { productoId },
      relations: ['producto'],
      order: { createdAt: 'DESC' },
    });
  }
}
