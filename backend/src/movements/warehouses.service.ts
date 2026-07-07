import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private repository: Repository<Warehouse>,
  ) {}

  findAll() {
    return this.repository.find({ order: { nombre: 'ASC' } });
  }

  async create(data: Partial<Warehouse>) {
    const warehouse = this.repository.create(data);
    return this.repository.save(warehouse);
  }

  async update(id: number, data: Partial<Warehouse>) {
    await this.repository.update(id, data);
    return this.findOne(id);
  }

  async findOne(id: number) {
    const warehouse = await this.repository.findOne({ where: { id } });
    if (!warehouse) throw new NotFoundException('Almacén no encontrado');
    return warehouse;
  }

  async remove(id: number) {
    const warehouse = await this.findOne(id);
    return this.repository.remove(warehouse);
  }
}