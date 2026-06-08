import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comodato } from './entities/comodato.entity';
import { CreateComodatoDto } from './dto/create-comodato.dto';
import { UpdateComodatoDto } from './dto/update-comodato.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ComodatosService {
  constructor(
    @InjectRepository(Comodato)
    private comodatosRepository: Repository<Comodato>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createComodatoDto: CreateComodatoDto): Promise<Comodato> {
    // Verificar que el producto existe
    const producto = await this.productsRepository.findOne({
      where: { id: createComodatoDto.productoId },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con id ${createComodatoDto.productoId} no encontrado`,
      );
    }

    if (producto.stock < 1) {
      throw new BadRequestException(
        `No hay stock disponible del producto ${producto.nombre}`,
      );
    }

    // Decrementar el stock (el producto está siendo prestado)
    producto.stock -= 1;
    await this.productsRepository.save(producto);

    // Crear el comodato con estado 'activo' por defecto
    const comodato = this.comodatosRepository.create({
      ...createComodatoDto,
      estado: createComodatoDto.estado || 'activo',
    });

    const saved = await this.comodatosRepository.save(comodato);
    return await this.findOne(saved.id);
  }

  async findAll(): Promise<Comodato[]> {
    return await this.comodatosRepository.find({ relations: ['producto', 'usuario'] });
  }

  async findOne(id: number): Promise<Comodato> {
    const comodato = await this.comodatosRepository.findOne({
      where: { id },
      relations: ['producto', 'usuario'],
    });
    if (!comodato) {
      throw new NotFoundException(`Comodato con id ${id} no encontrado`);
    }
    return comodato;
  }

  async update(
    id: number,
    updateComodatoDto: UpdateComodatoDto,
  ): Promise<Comodato> {
    const comodato = await this.findOne(id);

    // Si estamos cambiando el estado a 'devuelto', incrementar stock
    if (updateComodatoDto.estado === 'devuelto' && comodato.estado !== 'devuelto') {
      const producto = await this.productsRepository.findOne({
        where: { id: comodato.productoId },
      });

      if (producto) {
        producto.stock += 1;
        await this.productsRepository.save(producto);
      }
    }

    await this.comodatosRepository.update(id, updateComodatoDto);
    return this.findOne(id);
  }

  async devolverComodato(id: number): Promise<Comodato> {
    const comodato = await this.findOne(id);

    if (comodato.estado === 'devuelto') {
      throw new BadRequestException('El comodato ya ha sido devuelto');
    }

    // Incrementar stock del producto
    const producto = await this.productsRepository.findOne({
      where: { id: comodato.productoId },
    });

    if (producto) {
      producto.stock += 1;
      await this.productsRepository.save(producto);
    }

    // Marcar comodato como devuelto
    await this.comodatosRepository.update(id, { 
      estado: 'devuelto',
      fechaDevolucion: new Date() 
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const comodato = await this.findOne(id);

    // Si se elimina un comodato activo, devolver el stock
    if (comodato.estado !== 'devuelto') {
      const producto = await this.productsRepository.findOne({
        where: { id: comodato.productoId },
      });

      if (producto) {
        producto.stock += 1;
        await this.productsRepository.save(producto);
      }
    }

    await this.comodatosRepository.delete(id);
  }
}
