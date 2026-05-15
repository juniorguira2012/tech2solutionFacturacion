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
   * PROCESAR RECIBO MASIVO (Atómico: Todo o Nada)
   */
  async createBulk(bulkData: { tipo: string; nota: string; items: any[]; usuarioId?: any }) {
    const { tipo, nota, items, usuarioId } = bulkData;
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // CORRECCIÓN 2: Tipamos explícitamente el arreglo para evitar el error 'never'
      const movimientosCreados: Movement[] = [];

      for (const item of items) {
        const { productoId, cantidad, almacen } = item;

        const producto = await queryRunner.manager.findOne(Product, { where: { id: productoId } });
        
        if (!producto) {
          throw new NotFoundException(`Producto ID ${productoId} no encontrado en la lista`);
        }

        if (tipo.toUpperCase() === 'RECIBIR' || tipo.toUpperCase() === 'ENTRADA') {
          producto.stock += Number(cantidad);
        }

        await queryRunner.manager.save(Product, producto);

        // CORRECCIÓN 1: Forzamos la creación limpia mapeando las propiedades exactas de la entidad
        const datosMovimiento: any = {
          productoId: Number(productoId),
          tipo: tipo.toUpperCase(),
          cantidad: Number(cantidad),
          nota: `${nota} | Almacén: ${almacen || 'General'}`,
        };

        // Si tu DB usa strings/UUIDs para los usuarios, lo convertimos a String, si usa enteros a Number
        if (usuarioId) {
          datosMovimiento.usuarioId = typeof usuarioId === 'number' ? usuarioId : String(usuarioId);
        }

        const nuevoMovimiento = queryRunner.manager.create(Movement, datosMovimiento);
        const guardado = await queryRunner.manager.save(Movement, nuevoMovimiento);
        
        movimientosCreados.push(guardado);
      }

      await queryRunner.commitTransaction();
      return movimientosCreados;

    } catch (err) {
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