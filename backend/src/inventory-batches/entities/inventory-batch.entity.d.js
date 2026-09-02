import { Product } from '../../products/entities/product.entity';
export declare class InventoryBatch {
    id: number;
    numeroLote: string;
    cantidad: number;
    almacen: string;
    fechaVencimiento: Date;
    producto: Product;
    createdAt: Date;
    updatedAt: Date;
}
