import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
  ) {}

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
