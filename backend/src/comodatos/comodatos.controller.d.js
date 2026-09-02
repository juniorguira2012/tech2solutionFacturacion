import { ComodatosService } from './comodatos.service';
import { CreateComodatoDto } from './dto/create-comodato.dto';
import { UpdateComodatoDto } from './dto/update-comodato.dto';
export declare class ComodatosController {
    private readonly comodatosService;
    constructor(comodatosService: ComodatosService);
    create(createComodatoDto: CreateComodatoDto): Promise<import("./entities/comodato.entity").Comodato>;
    findAll(): Promise<import("./entities/comodato.entity").Comodato[]>;
    findOne(id: string): Promise<import("./entities/comodato.entity").Comodato>;
    devolver(id: string): Promise<import("./entities/comodato.entity").Comodato>;
    update(id: string, updateComodatoDto: UpdateComodatoDto): Promise<import("./entities/comodato.entity").Comodato>;
    remove(id: string): Promise<void>;
}
