import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
export declare class SalesController {
    private salesService;
    constructor(salesService: SalesService);
    create(createSaleDto: CreateSaleDto, userId: string): Promise<{
        items: import("./entities/sale-item.entity").SaleItem[];
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
    findAll(): Promise<import("./entities/sale.entity").Sale[]>;
    findOne(id: string): Promise<import("./entities/sale.entity").Sale | null>;
}
