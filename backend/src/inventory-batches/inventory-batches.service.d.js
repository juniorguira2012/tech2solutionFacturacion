import { Repository } from 'typeorm';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { Product } from '../products/entities/product.entity';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { UpdateInventoryBatchDto } from './dto/update-inventory-batch.dto';
export declare class InventoryBatchesService {
    private readonly inventoryBatchRepository;
    private readonly productRepository;
    constructor(inventoryBatchRepository: Repository<InventoryBatch>, productRepository: Repository<Product>);
    findAllBatches(): Promise<InventoryBatch[]>;
    createBatch(createDto: CreateInventoryBatchDto): Promise<InventoryBatch>;
    updateBatch(id: number, updateDto: UpdateInventoryBatchDto): Promise<InventoryBatch>;
    removeBatch(id: number): Promise<{
        message: string;
    }>;
}
