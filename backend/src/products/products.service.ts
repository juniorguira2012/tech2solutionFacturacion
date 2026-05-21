import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Provider } from '../providers/provider.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  // Crear un producto
  async create(createProductDto: CreateProductDto) {
    if (createProductDto.proveedorId) {
      const provider = await this.providerRepository.findOneBy({ id: createProductDto.proveedorId });
      if (!provider) {
        throw new NotFoundException(`Proveedor con ID ${createProductDto.proveedorId} no encontrado.`);
      }
    }
    const nuevoProducto = this.productRepository.create(createProductDto); // `proveedorId` en DTO es suficiente
    return await this.productRepository.save(nuevoProducto);
  }

  // Obtener todos los productos (Lo que usará tu tabla de Inventario)
  async findAll() {
    return await this.productRepository.find({
      order: { id: 'DESC' }, // Los más nuevos primero
    });
  }

  // Obtener uno solo
  async findOne(id: number) {
    const producto = await this.productRepository.findOneBy({ id });
    if (!producto)
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return producto;
  }

async update(id: number, updateProductDto: UpdateProductDto) {
  if (updateProductDto.proveedorId !== undefined && updateProductDto.proveedorId !== null) {
    const provider = await this.providerRepository.findOneBy({ id: updateProductDto.proveedorId });
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${updateProductDto.proveedorId} no encontrado.`);
    }
  }

  const { ...datosParaActualizar } = updateProductDto;

  const producto = await this.productRepository.preload({
    id: id,
    ...datosParaActualizar,
  });

  if (!producto)
    throw new NotFoundException(`No se pudo actualizar: ID ${id} no existe`);

  try {
    return await this.productRepository.save(producto);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error("Error en DB:", message);
    throw new BadRequestException(`Error de persistencia: ${message}`);
  }
}

  // Eliminar (Borrado físico)
  async remove(id: number) {
    const producto = await this.findOne(id);
    return await this.productRepository.remove(producto);
  }
}
