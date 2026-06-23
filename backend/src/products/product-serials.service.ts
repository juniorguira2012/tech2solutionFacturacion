import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.serialRepository.find({
      relations: ['producto'],
      order: { createdAt: 'DESC' },
    });
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

  async findByProductId(productId: number) {
    return this.serialRepository.find({
      where: { productoId: productId },
      relations: ['producto'],
      order: { createdAt: 'DESC' },
    });
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

      const existingSerial = await queryRunner.manager.findOne(ProductSerial, {
        where: { serialNumber: newSerialNumber, productoId: serial.productoId },
      });

      if (existingSerial && existingSerial.id !== id) {
        throw new BadRequestException(`El serial '${newSerialNumber}' ya existe para este producto.`);
      }

      serial.serialNumber = newSerialNumber;
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

      // --- INICIO: Lógica de sincronización de stock ---
      const nuevoStockDisponible = await queryRunner.manager.count(ProductSerial, {
        where: { productoId: serial.productoId, status: SerialStatus.DISPONIBLE },
      });

      await queryRunner.manager.update(Product, serial.productoId, { stock: nuevoStockDisponible });
      // --- FIN: Lógica de sincronización ---

      await queryRunner.commitTransaction();
      return serialActualizado;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}