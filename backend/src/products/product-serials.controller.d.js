import { ProductSerialsService } from './product-serials.service';
import { UpdateProductSerialDto } from './dto/update-product-serial.dto';
export declare class ProductSerialsController {
    private readonly serialsService;
    constructor(serialsService: ProductSerialsService);
    findAll(page?: number, limit?: number): Promise<{
        data: import("./entities/product-serial.entity").ProductSerial[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<import("./entities/product-serial.entity").ProductSerial>;
    findByProductId(productId: number, page?: number, limit?: number): Promise<{
        data: import("./entities/product-serial.entity").ProductSerial[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateSerialNumber(id: number, updateDto: UpdateProductSerialDto): Promise<import("./entities/product-serial.entity").ProductSerial>;
    updateStatus(id: number, updateDto: UpdateProductSerialDto): Promise<import("./entities/product-serial.entity").ProductSerial>;
}
