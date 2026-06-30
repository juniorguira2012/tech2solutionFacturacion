import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

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