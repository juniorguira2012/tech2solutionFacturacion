import { UnitsOfMeasureService } from './units-of-measure.service';
import { CreateUnitsOfMeasureDto } from './dto/create-units-of-measure.dto';
import { UpdateUnitsOfMeasureDto } from './dto/update-units-of-measure.dto';
export declare class UnitsOfMeasureController {
    private readonly unitsOfMeasureService;
    constructor(unitsOfMeasureService: UnitsOfMeasureService);
    create(createUnitsOfMeasureDto: CreateUnitsOfMeasureDto): Promise<import("./entities/units-of-measure.entity").UnidadMedida>;
    findAll(): Promise<import("./entities/units-of-measure.entity").UnidadMedida[]>;
    findOne(id: string): Promise<import("./entities/units-of-measure.entity").UnidadMedida>;
    update(id: string, updateUnitsOfMeasureDto: UpdateUnitsOfMeasureDto): Promise<import("./entities/units-of-measure.entity").UnidadMedida>;
    remove(id: string): Promise<{
        deleted: boolean;
        id: number;
    }>;
}
