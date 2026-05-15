import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Crear un producto
  async create(createProductDto: CreateProductDto) {
    const nuevoProducto = this.productRepository.create(createProductDto);
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

  // Actualizar datos
 // products.service.ts

async update(id: number, updateProductDto: UpdateProductDto) {
  // Eliminamos la lógica de desestructurar createdAt/updatedAt ya que el DTO
  // no los contiene y causaba error de TypeScript.
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
