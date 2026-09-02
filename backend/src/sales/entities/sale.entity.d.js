import { SaleItem } from './sale-item.entity';
export declare class Sale {
    id: number;
    cliente: string;
    rnc: string;
    subtotal: number;
    descuento: number;
    itbis: number;
    total: number;
    vendedorId: string;
    items: SaleItem[];
    fecha: Date;
}
