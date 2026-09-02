import { Product } from './product.entity';
export declare class ProductWarehouseStock {
    id: number;
    productoId: number;
    almacen: string;
    cantidad: number;
    producto: Product;
}
