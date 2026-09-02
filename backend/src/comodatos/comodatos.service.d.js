import { Repository } from 'typeorm';
import { Comodato } from './entities/comodato.entity';
import { CreateComodatoDto } from './dto/create-comodato.dto';
import { UpdateComodatoDto } from './dto/update-comodato.dto';
import { Product } from '../products/entities/product.entity';
export declare class ComodatosService {
    private comodatosRepository;
    private productsRepository;
    constructor(comodatosRepository: Repository<Comodato>, productsRepository: Repository<Product>);
    create(createComodatoDto: CreateComodatoDto): Promise<Comodato>;
    findAll(): Promise<Comodato[]>;
    findOne(id: number): Promise<Comodato>;
    update(id: number, updateComodatoDto: UpdateComodatoDto): Promise<Comodato>;
    devolverComodato(id: number): Promise<Comodato>;
    remove(id: number): Promise<void>;
}
