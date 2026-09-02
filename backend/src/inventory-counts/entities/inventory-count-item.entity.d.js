import { InventoryCount } from './inventory-count.entity';
export declare class InventoryCountItem {
    id: number;
    productoId: number;
    productoNombre: string;
    codigo: string;
    cantidadContada: number;
    cantidadSistema: number;
    precioUnitario: number;
    unidadMedida: string;
    diferencia: number;
    costoVariacion: number;
    inventoryCount: InventoryCount;
}
