import { InventoryCount } from './inventory-count.entity';
export declare class CountItem {
    id: number;
    conteo: InventoryCount;
    productoId: number;
    productoNombre: string;
    codigo: string;
    cantidadSistema: number;
    cantidadContada: number;
    precioUnitario: number;
    unidadMedida: string;
    createdAt: Date;
    updatedAt: Date;
    get diferencia(): number;
    get costoVariacion(): number;
}
