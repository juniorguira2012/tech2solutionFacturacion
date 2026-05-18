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
   * Crear un movimiento individual
   */
  async create(createMovementDto: CreateMovementDto) {
    const { productoId, tipo, cantidad, nota, usuarioId } = createMovementDto;

    const producto = await this.productRepository.findOneBy({ id: productoId });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    let nuevoStock = producto.stock;
    const tipoNormalizado = tipo.toUpperCase();

    // Lógica de cálculo de stock
    if (tipoNormalizado === 'ENTRADA' || tipoNormalizado === 'RECIBIR') {
      nuevoStock += cantidad;
    } else if (tipoNormalizado === 'SALIDA' || tipoNormalizado === 'DESPACHAR') {
      if (producto.stock < cantidad) {
        throw new BadRequestException(`Stock insuficiente. Disponible: ${producto.stock}`);
      }
      nuevoStock -= cantidad;
    } else if (tipoNormalizado === 'AJUSTE') {
      nuevoStock = cantidad;
    } else {
      throw new BadRequestException(`Tipo de movimiento no válido: ${tipo}`);
    }

    // Guardamos cambios (se podría envolver en transacción también, pero para 1 item es seguro)
    producto.stock = nuevoStock;
    await this.productRepository.save(producto);

    const movement = this.movementRepository.create({
      productoId,
      tipo: tipoNormalizado,
      cantidad,
      nota,
      usuarioId,
    });

    return await this.movementRepository.save(movement);
  }

  /**
   * PROCESAR RECIBO MASIVO (Atómico: Todo o Nada)
   */
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

        // --- NUEVA LÓGICA DE ACTUALIZACIÓN DE STOCK (ENTRADA / SALIDA) ---
        if (tipoNormalizado === 'RECIBIR' || tipoNormalizado === 'ENTRADA') {
          producto.stock += cantidadNumerica;
        } 
        else if (tipoNormalizado === 'DESPACHAR' || tipoNormalizado === 'SALIDA') {
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
          nota: `${nota} | Almacén: ${almacen || 'General'}`,
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