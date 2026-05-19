import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Añadimos DataSource
import { Movement } from './entities/movement.entity';
import { Product } from '../products/entities/product.entity';
import { CreateMovementDto } from './dto/create-movement.dto';

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

      // 3. APLICAR MOVIMIENTO (Restar de Origen y Sumar a Destino)
      // Si manejas stock global, el neto no cambia, pero registramos el movimiento en el Kardex.
      // Si manejas stocks separados por almacén, aquí restarías a uno y sumarías al otro.
      // Asumiendo manejo de Kardex por almacén con stock global de respaldo:
      producto.stock -= cantidadNumerica; // Descuento temporal para simular la salida del origen
      await queryRunner.manager.save(Product, producto);
      
      producto.stock += cantidadNumerica; // Lo devolvemos al stock global al entrar al destino
      await queryRunner.manager.save(Product, producto);

      // 4. REGISTRAR LOG DE SALIDA (ORIGEN)
      const logSalida = queryRunner.manager.create(Movement, {
        productoId,
        tipo: 'SALIDA',
        cantidad: cantidadNumerica,
        nota: `TRANSFERENCIA (ORIGEN: ${almacenOrigen} -> DESTINO: ${almacenDestino}) | ${nota}`,
        usuarioId: usuarioId ? String(usuarioId) : undefined
      });
      await queryRunner.manager.save(Movement, logSalida);

      // 5. REGISTRAR LOG DE ENTRADA (DESTINO)
      const logEntrada = queryRunner.manager.create(Movement, {
        productoId,
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

  const { productoId, tipo, cantidad, nota, usuarioId, almacenOrigen, almacenDestino } = createMovementDto;

  try {
    // Buscar el producto base
    const producto = await queryRunner.manager.findOne(Product, { where: { id: productoId } });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    const tipoNormalizado = tipo.toUpperCase();
    const cantidadNumerica = Number(cantidad);
    let nuevoStock = producto.stock;

    // =========================================================================
    // CASO ESPECIAL: TRANSFERENCIA ENTRE ALMACENES
    // No altera el stock global del producto, solo mueve stock interno
    // =========================================================================
    if (tipoNormalizado === 'TRANSFERIR') {
      if (!almacenOrigen || !almacenDestino) {
        throw new BadRequestException('Para una transferencia se requiere un almacén de origen y uno de destino.');
      }
      if (almacenOrigen === almacenDestino) {
        throw new BadRequestException('El almacén de origen y destino no pueden ser el mismo.');
      }

      // 1. [OPCIONAL] Aquí deberías restar/sumar en tu tabla intermedia de almacenes si la tienes.
      // Ejemplo: 
      // await queryRunner.manager.decrement('ProductoAlmacen', { productoId, almacenNombre: almacenOrigen }, 'stock', cantidadNumerica);
      // await queryRunner.manager.increment('ProductoAlmacen', { productoId, almacenNombre: almacenDestino }, 'stock', cantidadNumerica);

      // El stock global del producto se queda EXACTAMENTE IGUAL
      nuevoStock = producto.stock; 

    // =========================================================================
    // CASOS REGULARES: ENTRADAS, SALIDAS Y AJUSTES GLOBALES
    // =========================================================================
    } else {
      const tiposIncremento = ['ENTRADA', 'RECIBIR', 'DEVOLUCION', 'DEVOLUCION_FACTURA'];
      const tiposDecremento = ['SALIDA', 'DESPACHAR', 'DESCARTAR']; // Sacamos 'TRANSFERIR' de aquí

      if (tiposIncremento.includes(tipoNormalizado)) {
        nuevoStock += cantidadNumerica;
      } else if (tiposDecremento.includes(tipoNormalizado)) {
        // VALIDACIÓN CRÍTICA: No permitir stock negativo general
        if (producto.stock < cantidadNumerica) {
          throw new BadRequestException(
            `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${cantidadNumerica}`
          );
        }
        nuevoStock -= cantidadNumerica;
      } else if (tipoNormalizado === 'AJUSTE' || tipoNormalizado === 'AJUSTAR') {
        if (cantidadNumerica < 0) throw new BadRequestException('El stock no puede ser negativo tras un ajuste');
        nuevoStock = cantidadNumerica;
      } else {
        throw new BadRequestException(`Tipo de movimiento no válido: ${tipo}`);
      }

      // Actualizar el stock general del producto solo si NO es una transferencia
      producto.stock = nuevoStock;
      await queryRunner.manager.save(Product, producto);
    }

    // =========================================================================
    // REGISTRO DEL HISTORIAL DEL MOVIMIENTO (Mapeo limpio para evitar errores de TypeORM)
    // =========================================================================
    const movement = queryRunner.manager.create(Movement, {
      productoId: Number(productoId),
      tipo: tipoNormalizado,
      cantidad: cantidadNumerica,
      nuevoStock: Number(nuevoStock),
      nota: nota || undefined,
      usuarioId: usuarioId ? String(usuarioId) : undefined,
      almacenOrigen: almacenOrigen || undefined,
      almacenDestino: almacenDestino || undefined,
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
  async createBulk(bulkData: { tipo: string; nota: string; items: any[]; usuarioId?: any }) {
    const { tipo, nota, items, usuarioId } = bulkData;
    
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
        } 
        else if (tiposDecremento.includes(tipoNormalizado)) {
          // Validación crítica para no despachar lo que no existe
          if (producto.stock < cantidadNumerica) {
            throw new BadRequestException(
              `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${cantidadNumerica}`
            );
          }
          producto.stock -= cantidadNumerica;
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