import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { getTenantDataSource } from '../tenants/tenant.middleware';

@Injectable({ scope: Scope.REQUEST })
export class SalesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
  ) {}

  private get activeDataSource(): DataSource {
    return getTenantDataSource(this.request);
  }

  private get saleRepository(): Repository<Sale> {
    return this.activeDataSource.getRepository(Sale);
  }

  private get saleItemRepository(): Repository<SaleItem> {
    return this.activeDataSource.getRepository(SaleItem);
  }

  async create(createSaleDto: CreateSaleDto) {
    const { items, ...saleData } = createSaleDto;

    // Crear la venta
    const sale = this.saleRepository.create(saleData);
    const savedSale = await this.saleRepository.save(sale);

    // Crear los items de la venta
    const saleItems = items.map((item) =>
      this.saleItemRepository.create({
        ...item,
        saleId: savedSale.id,
      }),
    );

    await this.saleItemRepository.save(saleItems);

    return {
      ...savedSale,
      items: saleItems,
    };
  }

  async findAll() {
    return await this.saleRepository.find({
      relations: ['items'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number) {
    return await this.saleRepository.findOne({
      where: { id },
      relations: ['items'],
    });
  }
}
