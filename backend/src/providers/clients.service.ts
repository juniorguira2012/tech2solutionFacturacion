import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

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
