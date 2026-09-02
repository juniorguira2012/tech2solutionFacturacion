import { Sale } from './sale.entity';
export declare class SaleItem {
    id: number;
    saleId: number;
    sale: Sale;
    productoId: number;
    cantidad: number;
    precio: number;
}
