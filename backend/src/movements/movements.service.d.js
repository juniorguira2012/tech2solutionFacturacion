import { Repository, DataSource } from 'typeorm';
import { Movement } from './entities/movement.entity';
import { CreateBulkMovementDto } from './dto/create-bulk-movement.dto';
import { ReturnSerialDto } from './dto/return-serial.dto';
import { AssignSerialsToTechnicianDto } from './dto/assign-serials.dto';
import { Product } from '../products/entities/product.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { Technician } from './entities/technician.entity';
import { CreateInventoryBatchDto } from '../inventory-batches/dto/create-inventory-batch.dto';
import { UpdateInventoryBatchDto } from '../inventory-batches/dto/update-inventory-batch.dto';
export declare class MovementsService {
    private movementRepository;
    private productRepository;
    private technicianRepository;
    private inventoryBatchRepository;
    private dataSource;
    constructor(movementRepository: Repository<Movement>, productRepository: Repository<Product>, technicianRepository: Repository<Technician>, inventoryBatchRepository: Repository<InventoryBatch>, dataSource: DataSource);
    findTechnicians(): Promise<Technician[]>;
    createTechnician(payload: {
        nombre: string;
        telefono?: string;
        email?: string;
    }): Promise<Technician>;
    updateTechnician(id: number, payload: {
        nombre?: string;
        telefono?: string;
        email?: string;
        isActive?: boolean;
    }): Promise<Technician>;
    deleteTechnician(id: number): Promise<Technician>;
    private resolveTechnician;
    private updateWarehouseStock;
    private generateAndSaveBatch;
    private ensureDetailedStockInitialized;
    transferBulk(transferData: {
        productoId: number;
        almacenOrigen: string;
        almacenDestino: string;
        cantidad: number;
        nota: string;
        usuarioId?: any;
    }): Promise<{
        message: string;
        productoId: number;
        cantidad: number;
    }>;
    create(createMovementDto: CreateMovementDto): Promise<Movement>;
    createBulk(bulkData: CreateBulkMovementDto): Promise<{
        success: boolean;
        count: number;
        data: Movement[];
    }>;
    assignSerialsToTechnician(dto: AssignSerialsToTechnicianDto): Promise<{
        message: string;
    }>;
    returnSerialFromTechnician(dto: ReturnSerialDto, usuarioId: string): Promise<{
        message: string;
    }>;
    findAll(usuarioId?: string, page?: number, limit?: number): Promise<{
        data: Movement[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    findByProductId(productoId: number, page?: number, limit?: number): Promise<{
        data: Movement[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    findBySerialNumber(serialNumber: string): Promise<Movement[]>;
    findAllBatches(): Promise<InventoryBatch[]>;
    createBatch(createDto: CreateInventoryBatchDto): Promise<InventoryBatch>;
    updateBatch(id: number, updateDto: UpdateInventoryBatchDto): Promise<InventoryBatch>;
    removeBatch(id: number): Promise<{
        message: string;
    }>;
}
