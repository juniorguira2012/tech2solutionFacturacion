import { InventoryCountsService } from './inventory-counts.service';
export declare class CreateInventoryCountDto {
    almacen: string;
    descripcion?: string;
}
export declare class AddCountItemDto {
    productoId: number;
    cantidadContada?: number;
}
export declare class UpdateCountItemDto {
    cantidadContada: number;
}
export declare class InventoryCountsController {
    private readonly service;
    constructor(service: InventoryCountsService);
    createInventoryCount(dto: CreateInventoryCountDto, userId: string | undefined, userRole: string, permission: string): Promise<import("./entities/inventory-count.entity").InventoryCount>;
    listInventoryCounts(almacen?: string, permission?: string): Promise<import("./entities/inventory-count.entity").InventoryCount[]>;
    getInventoryCount(id: string, permission?: string): Promise<import("./entities/inventory-count.entity").InventoryCount>;
    addCountItem(id: string, dto: AddCountItemDto, userId: string | undefined, permission: string): Promise<import("./entities/count-item.entity").CountItem>;
    updateCountItem(id: string, itemId: string, dto: UpdateCountItemDto, userId: string | undefined, permission: string): Promise<import("./entities/count-item.entity").CountItem>;
    publishInventoryCount(id: string, userId: string | undefined, permission: string): Promise<import("./entities/inventory-count.entity").InventoryCount>;
    cancelInventoryCount(id: string, userId: string, permission: string): Promise<import("./entities/inventory-count.entity").InventoryCount>;
    removeInventoryCount(id: string, userId: string, userRole: string, permission: string): Promise<void>;
}
