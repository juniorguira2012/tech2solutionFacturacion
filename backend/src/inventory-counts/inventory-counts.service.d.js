import { Repository } from 'typeorm';
import { InventoryCount } from './entities/inventory-count.entity';
import { CountItem } from './entities/count-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateInventoryCountDto } from './dto/create-inventory-count.dto';
import { AddCountItemDto } from './dto/add-count-item.dto';
import { UpdateCountItemDto } from './dto/update-count-item.dto';
import { AuditLog } from './entities/audit-log.entity';
export declare class InventoryCountsService {
    private readonly inventoryCountRepository;
    private readonly countItemRepository;
    private readonly productRepository;
    private readonly auditLogRepository;
    constructor(inventoryCountRepository: Repository<InventoryCount>, countItemRepository: Repository<CountItem>, productRepository: Repository<Product>, auditLogRepository: Repository<AuditLog>);
    create(createInventoryCountDto: CreateInventoryCountDto, usuario: {
        id: string;
        rol: string;
    }): Promise<InventoryCount>;
    findAll(almacen?: string): Promise<InventoryCount[]>;
    findOne(id: number): Promise<InventoryCount>;
    addProductToCount(conteoId: number, addCountItemDto: AddCountItemDto): Promise<CountItem>;
    updateCountItem(conteoId: number, itemId: number, updateCountItemDto: UpdateCountItemDto): Promise<CountItem>;
    publishAdjustments(conteoId: number): Promise<InventoryCount>;
    cancelCount(conteoId: number): Promise<InventoryCount>;
    remove(id: number, usuarioId: string): Promise<void>;
}
