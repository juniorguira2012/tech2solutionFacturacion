import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryCount, ConteoEstado } from './entities/inventory-count.entity';
import { CountItem } from './entities/count-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateInventoryCountDto } from './dto/create-inventory-count.dto';
import { AddCountItemDto } from './dto/add-count-item.dto';
import { UpdateCountItemDto } from './dto/update-count-item.dto';

@Injectable()
export class InventoryCountsService {
  constructor(
    @InjectRepository(InventoryCount)
    private readonly inventoryCountRepository: Repository<InventoryCount>,
    @InjectRepository(CountItem)
    private readonly countItemRepository: Repository<CountItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    createInventoryCountDto: CreateInventoryCountDto,
    usuario: any,
  ): Promise<InventoryCount> {
    try {
      const inventoryCount = this.inventoryCountRepository.create({
        almacen: createInventoryCountDto.almacen,
        descripcion: createInventoryCountDto.descripcion,
        estado: ConteoEstado.EN_PROGRESO,
        items: [],
      });

      return await this.inventoryCountRepository.save(inventoryCount);
    } catch (error) {
      throw new BadRequestException(
        `Error al crear conteo de inventario: ${error.message}`,
      );
    }
  }

  async findAll(almacen?: string): Promise<InventoryCount[]> {
    try {
      const query = this.inventoryCountRepository.createQueryBuilder('ic');

      if (almacen) {
        query.where('ic.almacen = :almacen', { almacen });
      }

      return await query.orderBy('ic.createdAt', 'DESC').getMany();
    } catch (error) {
      throw new BadRequestException(
        `Error al buscar conteos: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<InventoryCount> {
    try {
      const inventoryCount = await this.inventoryCountRepository.findOne({
        where: { id },
        relations: ['items'],
      });

      if (!inventoryCount) {
        throw new NotFoundException(`Conteo con id ${id} no encontrado`);
      }

      return inventoryCount;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al buscar conteo: ${error.message}`,
      );
    }
  }

  async addProductToCount(
    conteoId: number,
    addCountItemDto: AddCountItemDto,
  ): Promise<CountItem> {
    try {
      const inventoryCount = await this.findOne(conteoId);

      if (inventoryCount.estado !== ConteoEstado.EN_PROGRESO) {
        throw new BadRequestException(
          'Solo se pueden agregar productos a conteos en estado EN_PROGRESO',
        );
      }

      const product = await this.productRepository.findOne({
        where: { id: addCountItemDto.productoId },
      });

      if (!product) {
        throw new NotFoundException(
          `Producto con id ${addCountItemDto.productoId} no encontrado`,
        );
      }

      const existingItem = await this.countItemRepository.findOne({
        where: {
          conteo: { id: conteoId },
          productoId: addCountItemDto.productoId,
        },
      });

      if (existingItem) {
        throw new BadRequestException(
          'Este producto ya está agregado al conteo',
        );
      }

      const countItem = this.countItemRepository.create({
        conteo: inventoryCount,
        productoId: product.id,
        productoNombre: product.nombre,
        codigo: product.codigo,
        cantidadSistema: product.stock,
        cantidadContada: addCountItemDto.cantidadContada ?? undefined,
        precioUnitario: product.precio,
        unidadMedida: product.unidadMedida || 'Unidad',
      });

      const savedItem = await this.countItemRepository.save(countItem);

      inventoryCount.totalProductos = (inventoryCount.totalProductos || 0) + 1;
      await this.inventoryCountRepository.save(inventoryCount);

      return savedItem;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al agregar producto al conteo: ${error.message}`,
      );
    }
  }

  async updateCountItem(
    conteoId: number,
    itemId: number,
    updateCountItemDto: UpdateCountItemDto,
  ): Promise<CountItem> {
    try {
      const inventoryCount = await this.findOne(conteoId);

      if (inventoryCount.estado !== ConteoEstado.EN_PROGRESO) {
        throw new BadRequestException(
          'Solo se pueden actualizar items en conteos EN_PROGRESO',
        );
      }

      const countItem = await this.countItemRepository.findOne({
        where: { id: itemId },
      });

      if (!countItem) {
        throw new NotFoundException(`Item con id ${itemId} no encontrado`);
      }

      countItem.cantidadContada = updateCountItemDto.cantidadContada;

      return await this.countItemRepository.save(countItem);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar item del conteo: ${error.message}`,
      );
    }
  }

  async publishAdjustments(conteoId: number): Promise<InventoryCount> {
    try {
      const inventoryCount = await this.findOne(conteoId);

      if (inventoryCount.estado === ConteoEstado.CANCELADO) {
        throw new BadRequestException('No se puede publicar un conteo cancelado');
      }

      inventoryCount.estado = ConteoEstado.AJUSTES_PUBLICADOS;

      let totalVariacion = 0;

      for (const item of inventoryCount.items) {
        const diferencia = item.diferencia;

        if (diferencia !== 0) {
          const product = await this.productRepository.findOne({
            where: { id: item.productoId },
          });

          if (product) {
            const nuevoStock = product.stock + diferencia;
            product.stock = nuevoStock;

            await this.productRepository.save(product);
          }
        }

        totalVariacion += item.costoVariacion;
      }

      inventoryCount.totalVariacion = totalVariacion;

      return await this.inventoryCountRepository.save(inventoryCount);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al publicar ajustes: ${error.message}`,
      );
    }
  }

  async cancelCount(conteoId: number): Promise<InventoryCount> {
    try {
      const inventoryCount = await this.findOne(conteoId);

      inventoryCount.estado = ConteoEstado.CANCELADO;

      return await this.inventoryCountRepository.save(inventoryCount);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al cancelar conteo: ${error.message}`,
      );
    }
  }
}
