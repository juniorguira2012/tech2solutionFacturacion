import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
export declare class WarehousesService {
    private repository;
    constructor(repository: Repository<Warehouse>);
    findAll(): Promise<Warehouse[]>;
    create(data: Partial<Warehouse>): Promise<Warehouse>;
    update(id: number, data: Partial<Warehouse>): Promise<Warehouse>;
    findOne(id: number): Promise<Warehouse>;
    remove(id: number): Promise<Warehouse>;
}
