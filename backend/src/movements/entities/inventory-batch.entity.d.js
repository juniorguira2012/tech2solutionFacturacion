import { Product } from '../../products/entities/product.entity';
export declare class InventoryBatch {
    id: number;
    productoId: number;
    producto: Product;
    numeroLote: string;
    cantidad: number;
    almacen: string;
    fechaVencimiento: Date;
    createdAt: Date;
    updatedAt: Date;
}
