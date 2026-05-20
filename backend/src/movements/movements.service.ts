import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm'; // Añadimos DataSource
import { Movement } from './entities/movement.entity';
import { Product } from '../products/entities/product.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { ProductWarehouseStock } from '../products/entities/product-warehouse-stock.entity';

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(Movement)
    private movementRepository: Repository<Movement>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource, // <--- Inyectado para transacciones robustas
  ) {}

  /**
   * Helper para actualizar el stock por almacén de forma atómica
   */
  private async updateWarehouseStock(
    manager: EntityManager,
    productoId: number,
    almacen: string,
    cantidad: number,
    isAbsolute: boolean = false,
  ) {
    if (!almacen) return;
    
    let stock = await manager.findOne(ProductWarehouseStock, {
      where: { productoId: Number(productoId), almacen },
    });

    if (!stock) {
      stock = manager.create(ProductWarehouseStock, { productoId: Number(productoId), almacen, cantidad: 0 });
    }

    stock.cantidad = isAbsolute ? cantidad : Number(stock.cantidad) + cantidad;
    
    await manager.save(ProductWarehouseStock, stock);
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
      // 1. Buscar el producto para validar que exista
      const producto = await queryRunner.manager.findOne(Product, { where: { id: productoId } });
      if (!producto) {
        throw new NotFoundException(`Producto ID ${productoId} no encontrado`);
      }

      const cantidadNumerica = Number(cantidad);

      // 2. VALIDAR STOCK EN ORIGEN
      // NOTA: Si manejas una tabla relacional de stock por almacén (ej: ProductStock), 
      // buscarías el stock específico de 'almacenOrigen'. Si usas el stock global por ahora:
      if (producto.stock < cantidadNumerica) {
        throw new BadRequestException(
          `Stock insuficiente en ${almacenOrigen}. Disponible: ${producto.stock}, Requerido: ${cantidadNumerica}`
        );
      }

      // 3. ACTUALIZAR STOCKS POR ALMACÉN
      await this.updateWarehouseStock(queryRunner.manager, productoId, almacenOrigen, -cantidadNumerica);
      await this.updateWarehouseStock(queryRunner.manager, productoId, almacenDestino, cantidadNumerica);

      // El stock global no cambia en una transferencia entre almacenes.

      // 4. REGISTRAR LOG DE SALIDA (ORIGEN)
      const logSalida = queryRunner.manager.create(Movement, {
        productoId: Number(productoId),
        tipo: 'SALIDA',
        cantidad: cantidadNumerica,
        nota: `TRANSFERENCIA (ORIGEN: ${almacenOrigen} -> DESTINO: ${almacenDestino}) | ${nota}`,
        usuarioId: usuarioId ? String(usuarioId) : undefined
      });
      await queryRunner.manager.save(Movement, logSalida);

      // 5. REGISTRAR LOG DE ENTRADA (DESTINO)
      const logEntrada = queryRunner.manager.create(Movement, {
        productoId: Number(productoId),
        tipo: 'ENTRADA',
        cantidad: cantidadNumerica,
        nota: `TRANSFERENCIA (RECIBIDO DESDE: ${almacenOrigen}) | ${nota}`,
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
async create(createMovementDto: CreateMovementDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  const { productoId, tipo, cantidad, nota, usuarioId, almacenOrigen, almacenDestino, referencia } = createMovementDto;

  try {
    // Buscar el producto base
    const producto = await queryRunner.manager.findOne(Product, { where: { id: productoId } });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    const tipoNormalizado = tipo.toUpperCase();
    const cantidadNumerica = Number(cantidad);
    let nuevoStock = producto.stock;
    const targetAlmacen = almacenDestino || almacenOrigen || producto.almacen || 'Principal';

    // =========================================================================
    // CASO ESPECIAL: TRANSFERENCIA ENTRE ALMACENES
    // =========================================================================
    if (tipoNormalizado === 'TRANSFERIR') {
      if (!almacenOrigen || !almacenDestino) {
        throw new BadRequestException('Para una transferencia se requiere un almacén de origen y uno de destino.');
      }
      await this.updateWarehouseStock(queryRunner.manager, productoId, almacenOrigen, -cantidadNumerica);
      await this.updateWarehouseStock(queryRunner.manager, productoId, almacenDestino, cantidadNumerica);
      
    // CASOS REGULARES: ENTRADAS, SALIDAS Y AJUSTES GLOBALES
    } else {
        // (Mercancía que ENTRA al almacén)
        const tiposIncremento = ['ENTRADA', 'RECIBIR', 'DEVOLUCION_FACTURA'];
        // (Mercancía que SALE del almacén hacia afuera o al proveedor)
        const tiposDecremento = ['SALIDA', 'DESPACHAR', 'DESCARTAR', 'DEVOLUCION']; 

        if (tiposIncremento.includes(tipoNormalizado)) {
          nuevoStock += cantidadNumerica;
          await this.updateWarehouseStock(queryRunner.manager, productoId, targetAlmacen, cantidadNumerica);

        } else if (tiposDecremento.includes(tipoNormalizado)) {
          if (producto.stock < cantidadNumerica) {
            throw new BadRequestException(
              `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${cantidadNumerica}`
            );
          }
          nuevoStock -= cantidadNumerica;   
          await this.updateWarehouseStock(queryRunner.manager, productoId, targetAlmacen, -cantidadNumerica);

        } else if (tipoNormalizado === 'AJUSTE' || tipoNormalizado === 'AJUSTAR') {
          if (cantidadNumerica < 0) throw new BadRequestException('El stock no puede ser negativo tras un ajuste');
          
          await this.updateWarehouseStock(queryRunner.manager, productoId, targetAlmacen, cantidadNumerica, true);
          
          // Recalculamos el stock global basado en todos los almacenes
          const allStocks = await queryRunner.manager.find(ProductWarehouseStock, { where: { productoId: Number(productoId) } });
          nuevoStock = allStocks.reduce((sum, s) => sum + Number(s.cantidad), 0);

          // Sincronizamos el precio/costo del producto con el valor enviado en el ajuste
          if (createMovementDto.costoUnitario !== undefined && createMovementDto.costoUnitario !== null) {
            producto.precio = Number(createMovementDto.costoUnitario);
          }
          
        } else {
          throw new BadRequestException(`Tipo de movimiento no válido: ${tipo}`);
        }

        // Actualizar el stock general del producto de forma centralizada
        producto.stock = nuevoStock;
      }
    await queryRunner.manager.save(Product, producto);

    // =========================================================================
    // REGISTRO DEL HISTORIAL DEL MOVIMIENTO (Mapeo limpio para evitar errores de TypeORM)
    // =========================================================================
    const movement = queryRunner.manager.create(Movement, {
      productoId: Number(productoId),
      tipo: tipoNormalizado,
      cantidad: cantidadNumerica,
      nuevoStock: Number(nuevoStock),
      nota,
      usuarioId: usuarioId ? String(usuarioId) : undefined,
      almacenOrigen: almacenOrigen || targetAlmacen,
      almacenDestino: almacenDestino || targetAlmacen,
      costoUnitario: createMovementDto.costoUnitario ? Number(createMovementDto.costoUnitario) : undefined,
      referencia: referencia || undefined, // Aseguramos que se guarde la referencia si existe
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
   * PROCESAR RECIBO / DESPACHO MASIVO (Atómico: Todo o Nada)
   */
  async createBulk(bulkData: { tipo: string; nota: string; items: any[]; usuarioId?: any; referencia?: string }) {
    const { tipo, nota, items, usuarioId, referencia } = bulkData;
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const movimientosCreados: Movement[] = [];
      const tipoNormalizado = tipo.trim().toUpperCase();

      for (const item of items) {
        const { productoId, cantidad, almacen } = item;

        const producto = await queryRunner.manager.findOne(Product, { where: { id: productoId } });
        
        if (!producto) {
          throw new NotFoundException(`Producto ID ${productoId} no encontrado en la lista`);
        }

        const cantidadNumerica = Number(cantidad);

        const tiposIncremento = ['RECIBIR', 'ENTRADA', 'DEVOLUCION'];
        const tiposDecremento = ['DESPACHAR', 'SALIDA', 'DESCARTAR', 'TRANSFERIR'];

        // --- NUEVA LÓGICA DE ACTUALIZACIÓN DE STOCK (ENTRADA / SALIDA) ---
        if (tiposIncremento.includes(tipoNormalizado)) {
          producto.stock += cantidadNumerica;
          await this.updateWarehouseStock(queryRunner.manager, productoId, almacen || 'Principal', cantidadNumerica);
        } 
        else if (tiposDecremento.includes(tipoNormalizado)) {
          // Validación crítica para no despachar lo que no existe
          if (producto.stock < cantidadNumerica) {
            throw new BadRequestException(
              `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${cantidadNumerica}`
            );
          }
          producto.stock -= cantidadNumerica;
          await this.updateWarehouseStock(queryRunner.manager, productoId, almacen || 'Principal', -cantidadNumerica);
        } else {
          throw new BadRequestException(`Tipo de movimiento masivo no válido: ${tipo}`);
        }

        // Guardamos el producto con el stock actualizado dentro de la transacción
        await queryRunner.manager.save(Product, producto);

        // Forzamos la creación limpia mapeando las propiedades exactas de la entidad
        const datosMovimiento: any = {
          productoId: Number(productoId),
          tipo: tipoNormalizado,
          cantidad: cantidadNumerica,
          nuevoStock: producto.stock,
          nota: `${nota} | Almacén: ${almacen || 'General'}`,
          almacenOrigen: almacen || undefined, // Asumimos que 'almacen' en el item es el origen para bulk
          almacenDestino: undefined, // No aplica directamente para bulk-receive/despachar
          referencia: referencia || undefined,
        };

        if (usuarioId) {
          datosMovimiento.usuarioId = typeof usuarioId === 'number' ? usuarioId : String(usuarioId);
        }

        const nuevoMovimiento = queryRunner.manager.create(Movement, datosMovimiento);
        const guardado = await queryRunner.manager.save(Movement, nuevoMovimiento);
        
        movimientosCreados.push(guardado);
      }

      // Si todo el bucle se ejecuta correctamente, guardamos en la Base de Datos
      await queryRunner.commitTransaction();
      return movimientosCreados;

    } catch (err) {
      // Si un solo producto falla o no tiene stock, se cancela TODO el despacho automáticamente
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.movementRepository.find({
      relations: ['producto'], // Prueba quitando 'producto.proveedor' si falla
      order: { createdAt: 'DESC' },
    });
  }

  async findByProductId(productoId: number) {
    return await this.movementRepository.find({
      where: { productoId },
      relations: ['producto', 'producto.proveedor'],
      order: { createdAt: 'DESC' },
    });
  }
}