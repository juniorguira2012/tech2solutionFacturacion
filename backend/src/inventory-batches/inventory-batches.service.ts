import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// ⚠️ REVISA ESTAS RUTAS: Asegúrate de que apunten a tus entidades y DTOs reales
import { InventoryBatch } from './entities/inventory-batch.entity'; 
import { Product } from '../products/entities/product.entity'; // O donde tengas tu entidad de Producto
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { UpdateInventoryBatchDto } from './dto/update-inventory-batch.dto';

@Injectable()
export class InventoryBatchesService {
  constructor(
    // 🚀 Inyectamos el repositorio de Lotes
    @InjectRepository(InventoryBatch)
    private readonly inventoryBatchRepository: Repository<InventoryBatch>,

    // 🚀 Inyectamos el repositorio de Productos (necesario para validar al crear el lote)
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // --- GESTIÓN DE LOTES (INVENTORY BATCHES) ---

  async findAllBatches() {
    return this.inventoryBatchRepository.find({
      relations: ['producto'], // Esto hace el JOIN automático con la tabla de productos
      order: { createdAt: 'DESC' },
    });
  }

  async createBatch(createDto: CreateInventoryBatchDto) {
    // Validamos que el producto realmente exista en la BD antes de asignarle un lote
    const producto = await this.productRepository.findOneBy({ id: createDto.productoId });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${createDto.productoId} no encontrado.`);
    }

    const nuevoLote = this.inventoryBatchRepository.create({
      ...createDto,
      producto: producto,
    });

    return this.inventoryBatchRepository.save(nuevoLote);
  }

  async updateBatch(id: number, updateDto: UpdateInventoryBatchDto) {
    // El preload busca el ID y mapea los cambios del DTO de forma segura
    const lote = await this.inventoryBatchRepository.preload({
      id: id,
      ...updateDto,
    });

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado.`);
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