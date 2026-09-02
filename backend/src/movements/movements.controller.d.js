import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { CreateBulkMovementDto } from './dto/create-bulk-movement.dto';
import { AssignSerialsToTechnicianDto } from './dto/assign-serials.dto';
export declare class MovementsController {
    private readonly movementsService;
    constructor(movementsService: MovementsService);
    create(createMovementDto: CreateMovementDto): Promise<import("./entities/movement.entity").Movement>;
    transferBulk(transferData: any): Promise<{
        message: string;
        productoId: number;
        cantidad: number;
    }>;
    createBulk(bulkData: CreateBulkMovementDto): Promise<{
        success: boolean;
        count: number;
        data: import("./entities/movement.entity").Movement[];
    }>;
    assignToTechnician(assignData: AssignSerialsToTechnicianDto): Promise<{
        message: string;
    }>;
    returnFromTechnician(payload: {
        serialNumber: string;
        nota?: string;
        usuarioId?: string;
    }): Promise<{
        message: string;
    }>;
    findTechnicians(): Promise<import("./entities/technician.entity").Technician[]>;
    createTechnician(payload: {
        nombre: string;
        telefono?: string;
        email?: string;
    }): Promise<import("./entities/technician.entity").Technician>;
    updateTechnician(id: number, payload: {
        nombre?: string;
        telefono?: string;
        email?: string;
        isActive?: boolean;
    }): Promise<import("./entities/technician.entity").Technician>;
    deleteTechnician(id: number): Promise<import("./entities/technician.entity").Technician>;
    findAll(productoId?: string, page?: string, limit?: string): Promise<{
        data: import("./entities/movement.entity").Movement[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    findByProduct(id: number, page?: string, limit?: string): Promise<{
        data: import("./entities/movement.entity").Movement[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    findBySerialNumber(serialNumber: string): Promise<import("./entities/movement.entity").Movement[]>;
}
