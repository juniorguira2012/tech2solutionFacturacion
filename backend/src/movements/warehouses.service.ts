import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource, Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { getTenantDataSource } from '../tenants/tenant.middleware';

@Injectable({ scope: Scope.REQUEST })
export class WarehousesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<Warehouse> {
    return getTenantDataSource(this.request).getRepository(Warehouse);
  }

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