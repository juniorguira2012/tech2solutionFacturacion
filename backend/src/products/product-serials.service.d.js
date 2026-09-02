import { Repository, DataSource } from 'typeorm';
import { ProductSerial, SerialStatus } from './entities/product-serial.entity';
import { Product } from './entities/product.entity';
import { UpdateProductSerialDto } from './dto/update-product-serial.dto';
export declare class ProductSerialsService {
    private readonly serialRepository;
    private readonly productRepository;
    private readonly dataSource;
    constructor(serialRepository: Repository<ProductSerial>, productRepository: Repository<Product>, dataSource: DataSource);
    findAll(page?: number, limit?: number): Promise<{
        data: ProductSerial[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByProductId(productId: number, page?: number, limit?: number): Promise<{
        data: ProductSerial[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<ProductSerial>;
    updateSerialNumber(id: number, updateDto: UpdateProductSerialDto): Promise<ProductSerial>;
    updateStatus(id: number, status: SerialStatus): Promise<ProductSerial>;
}
