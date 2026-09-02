import { Repository } from 'typeorm';
import { UnidadMedida } from './entities/units-of-measure.entity';
import { CreateUnitsOfMeasureDto } from './dto/create-units-of-measure.dto';
import { UpdateUnitsOfMeasureDto } from './dto/update-units-of-measure.dto';
export declare class UnitsOfMeasureService {
    private readonly repository;
    constructor(repository: Repository<UnidadMedida>);
    create(createDto: CreateUnitsOfMeasureDto): Promise<UnidadMedida>;
    findAll(): Promise<UnidadMedida[]>;
    findOne(id: number): Promise<UnidadMedida>;
    update(id: number, updateDto: UpdateUnitsOfMeasureDto): Promise<UnidadMedida>;
    remove(id: number): Promise<{
        deleted: boolean;
        id: number;
    }>;
}
