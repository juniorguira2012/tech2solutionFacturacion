import { WarehousesService } from './warehouses.service';
export declare class WarehousesController {
    private readonly service;
    constructor(service: WarehousesService);
    findAll(): Promise<import("./entities/warehouse.entity").Warehouse[]>;
    create(data: any, permission: string): Promise<import("./entities/warehouse.entity").Warehouse>;
    update(id: number, data: any, permission: string): Promise<import("./entities/warehouse.entity").Warehouse>;
    remove(id: number, permission: string): Promise<import("./entities/warehouse.entity").Warehouse>;
}
