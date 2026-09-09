import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Movement } from '../movements/entities/movement.entity';
import { ProductSerial, SerialStatus } from './entities/product-serial.entity';
import { Product } from './entities/product.entity';
import { UpdateProductSerialDto } from './dto/update-product-serial.dto';

@Injectable()
export class ProductSerialsService {
  constructor(
    @InjectRepository(ProductSerial)
    private readonly serialRepository: Repository<ProductSerial>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
    private readonly dataSource: DataSource,
  ) {}

  private async addTechniciansToSerials(serials: ProductSerial[]) {
    if (serials.length === 0) return serials;

    const movements = await this.movementRepository.find({
      where: [
        { tipo: 'ASIGNACION_TECNICO' },
        { tipo: 'DEVOLUCION_TECNICO' },
      ],
      relations: ['technician'],
      order: { createdAt: 'DESC' },
    });
    const latestMovementBySerial = new Map<string, Movement>();

    for (const movement of movements) {
      for (const serialNumber of movement.serials || []) {
        if (!latestMovementBySerial.has(serialNumber)) {
          latestMovementBySerial.set(serialNumber, movement);
        }
      }
    }

    return serials.map(serial => {
      const latestMovement = latestMovementBySerial.get(serial.serialNumber);
      return {
        ...serial,
        technician:
          latestMovement?.tipo === 'ASIGNACION_TECNICO'
            ? latestMovement.technician || null
            : null,
      };
    });
  }

  async findAll(query?: { page?: number; limit?: number }) {
    // Si el Frontend no pide paginación explícita, devuelve un Array plano (máximo 50)
    if (!query?.page && !query?.limit) {
      const serials = await this.serialRepository.find({
        relations: ['producto'],
        order: { createdAt: 'DESC' },
        take: 50, // Límite de seguridad para cuidar la RAM
      });
      return this.addTechniciansToSerials(serials);
    }

    // Si se solicita paginación, devuelve el objeto estructurado
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const [data, total] = await this.serialRepository.findAndCount({
      relations: ['producto'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data: await this.addTechniciansToSerials(data), meta: { total, page, limit } };
  }

  async findOne(id: number) {
    const serial = await this.serialRepository.findOne({
      where: { id },
      relations: ['producto'],
    });
    if (!serial) {
      throw new NotFoundException(`Serial con ID ${id} no encontrado.`);
    }
    return serial;
  }

  // ✅ AGREGADO LÍMITE DE SEGURIDAD PARA CONSULTAS POR PRODUCTO
  async findByProductId(productId: number, limit: number = 50) {
    const serials = await this.serialRepository.find({
      where: { productoId: productId },
      relations: ['producto'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return this.addTechniciansToSerials(serials);
  }

  async updateSerialNumber(id: number, updateDto: UpdateProductSerialDto) {
    const newSerialNumber = updateDto.serialNumber?.trim();
    if (!newSerialNumber) {
      throw new BadRequestException('El número de serie no puede estar vacío.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const serial = await queryRunner.manager.findOne(ProductSerial, { where: { id } });
      if (!serial) {
        throw new NotFoundException(`Serial con ID ${id} no encontrado.`);
      }

      if (serial.status !== SerialStatus.DISPONIBLE) {
        throw new BadRequestException(`No se puede modificar el serial. Su estado es '${serial.status}'.`);
      }

      const existingSerial = await queryRunner.manager
        .getRepository(ProductSerial)
        .createQueryBuilder('serial')
        .where('UPPER(TRIM(serial.serialNumber)) = UPPER(TRIM(:serialNumber))', {
          serialNumber: newSerialNumber,
        })
        .andWhere('serial.id != :id', { id })
        .getOne();

      if (existingSerial) {
        throw new BadRequestException(
          `El serial '${newSerialNumber}' ya existe en la base de datos y no se puede repetir.`,
        );
      }

      serial.serialNumber = newSerialNumber.toUpperCase();
      const updatedSerial = await queryRunner.manager.save(ProductSerial, serial);

      await queryRunner.commitTransaction();
      return updatedSerial;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: number, status: SerialStatus) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const serial = await queryRunner.manager.findOne(ProductSerial, {
        where: { id },
        relations: ['producto'],
      });

      if (!serial) {
        throw new NotFoundException(`Serial con ID ${id} no encontrado.`);
      }

      serial.status = status;
      const serialActualizado = await queryRunner.manager.save(ProductSerial, serial);

      const nuevoStockDisponible = await queryRunner.manager.count(ProductSerial, {
        where: { productoId: serial.productoId, status: SerialStatus.DISPONIBLE },
      });

      await queryRunner.manager.update(Product, serial.productoId, { stock: nuevoStockDisponible });

      await queryRunner.commitTransaction();
      return serialActualizado;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const serial = await queryRunner.manager.findOne(ProductSerial, {
        where: { id },
      });

      if (!serial) {
        throw new NotFoundException(`Serial con ID ${id} no encontrado.`);
      }

      if (serial.status !== SerialStatus.DISPONIBLE) {
        throw new BadRequestException(
          `No se puede eliminar el serial porque su estado es '${serial.status}'.`,
        );
      }

      await queryRunner.manager.remove(ProductSerial, serial);

      const stockDisponible = await queryRunner.manager.count(ProductSerial, {
        where: { productoId: serial.productoId, status: SerialStatus.DISPONIBLE },
      });
      await queryRunner.manager.update(Product, serial.productoId, {
        stock: stockDisponible,
      });

      await queryRunner.commitTransaction();
      return { message: `Serial '${serial.serialNumber}' eliminado correctamente.` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}