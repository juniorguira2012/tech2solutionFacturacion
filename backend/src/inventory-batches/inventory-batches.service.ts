import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InventoryBatch } from './entities/inventory-batch.entity'; 
import { Product } from '../products/entities/product.entity'; 
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { UpdateInventoryBatchDto } from './dto/update-inventory-batch.dto';

@Injectable()
export class InventoryBatchesService {
  constructor(
    @InjectRepository(InventoryBatch)
    private readonly inventoryBatchRepository: Repository<InventoryBatch>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // --- GESTIÓN DE LOTES (INVENTORY BATCHES) ---

  async findAllBatches() {
    return this.inventoryBatchRepository.find({
      relations: ['producto'], // Mantiene el JOIN automático impecable
      order: { createdAt: 'DESC' },
    });
  }

  async createBatch(createDto: CreateInventoryBatchDto) {
    // 🌟 SEPARACIÓN LIMPIA: Sacamos productoId y agrupamos el resto de propiedades
    const { productoId, ...datosLote } = createDto;

    // Validamos que el producto realmente exista
    const producto = await this.productRepository.findOneBy({ id: productoId });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado.`);
    }

    // Creamos el lote asignando la entidad producto completa a la relación
    const nuevoLote = this.inventoryBatchRepository.create({
      ...datosLote,
      producto: producto,
    });

    return this.inventoryBatchRepository.save(nuevoLote);
  }

  async updateBatch(id: number, updateDto: UpdateInventoryBatchDto) {
    // 🌟 SEPARACIÓN LIMPIA: Evitamos pasar el id numérico suelto al preload
    const { productoId, ...datosActualizar } = updateDto;

    // El preload mapea de forma segura los campos planos del lote (cantidad, almacén, etc.)
    const lote = await this.inventoryBatchRepository.preload({
      id: id,
      ...datosActualizar,
    });

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado.`);
    }

    // Si el usuario envió un nuevo productoId en la actualización, lo validamos y asignamos
    if (productoId) {
      const producto = await this.productRepository.findOneBy({ id: productoId });
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${productoId} no encontrado.`);
      }
      lote.producto = producto; // Actualizamos la relación de forma segura
    }

    return this.inventoryBatchRepository.save(lote);
  }

  async removeBatch(id: number) {
    const lote = await this.inventoryBatchRepository.findOneBy({ id });
    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado.`);
    }
    
    await this.inventoryBatchRepository.remove(lote);
    return { message: `Lote con ID ${id} eliminado con éxito.` };
  }
}