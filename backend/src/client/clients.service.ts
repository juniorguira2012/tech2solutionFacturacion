import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource, Repository } from 'typeorm';
import { Client } from '../client/entities/client.entity';
import { getTenantDataSource } from '../tenants/tenant.middleware';

@Injectable({ scope: Scope.REQUEST })
export class ClientsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
  ) {}

  private get clientsRepository(): Repository<Client> {
    return getTenantDataSource(this.request).getRepository(Client);
  }

  findAll(): Promise<Client[]> {
    return this.clientsRepository.find({
      where: { isActive: true },
      order: { nombre: 'ASC' },
    });
  }

  async create(clientData: Partial<Client>): Promise<Client> {
    const newClient = this.clientsRepository.create(clientData);
    return this.clientsRepository.save(newClient);
  }

  async update(id: number, clientData: Partial<Client>): Promise<Client> {
    const client = await this.clientsRepository.preload({
      id,
      ...clientData,
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return this.clientsRepository.save(client);
  }

  async remove(id: number): Promise<Client> {
    const client = await this.clientsRepository.findOneBy({ id });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    client.isActive = false;
    return this.clientsRepository.save(client);
  }
}
