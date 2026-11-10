import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource, Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { getTenantDataSource } from '../tenants/tenant.middleware';

@Injectable({ scope: Scope.REQUEST })
export class ProvidersService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
  ) {}

  private get providerRepository(): Repository<Provider> {
    return getTenantDataSource(this.request).getRepository(Provider);
  }

  async create(createProviderDto: any) {
    const provider = this.providerRepository.create(createProviderDto);
    return await this.providerRepository.save(provider);
  }

  async findAll() {
    return await this.providerRepository.find({
      //relations: ['proveedor'],
      order: { id: 'DESC' },
    });
  }

  async update(id: number, updateProviderDto: any) {
    const provider = await this.providerRepository.preload({
      id: id,
      ...updateProviderDto,
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    return await this.providerRepository.save(provider);
  }

  async remove(id: number) {
    const provider = await this.providerRepository.findOneBy({ id });
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return await this.providerRepository.remove(provider);
  }
}