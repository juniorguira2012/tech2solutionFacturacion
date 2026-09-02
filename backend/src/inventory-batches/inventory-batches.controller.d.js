import { InventoryBatchesService } from './inventory-batches.service';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { UpdateInventoryBatchDto } from './dto/update-inventory-batch.dto';
export declare class InventoryBatchesController {
    private readonly batchesService;
    constructor(batchesService: InventoryBatchesService);
    findAll(): Promise<import("./entities/inventory-batch.entity").InventoryBatch[]>;
    create(createDto: CreateInventoryBatchDto): Promise<import("./entities/inventory-batch.entity").InventoryBatch>;
    update(id: number, updateDto: UpdateInventoryBatchDto): Promise<import("./entities/inventory-batch.entity").InventoryBatch>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
