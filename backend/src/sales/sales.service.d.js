import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
export declare class SalesService {
    private saleRepository;
    private saleItemRepository;
    constructor(saleRepository: Repository<Sale>, saleItemRepository: Repository<SaleItem>);
    create(createSaleDto: CreateSaleDto): Promise<{
        items: SaleItem[];
        id: number;
        cliente: string;
        rnc: string;
        subtotal: number;
        descuento: number;
        itbis: number;
        total: number;
        vendedorId: string;
        fecha: Date;
    }>;
    findAll(): Promise<Sale[]>;
    findOne(id: number): Promise<Sale | null>;
}
