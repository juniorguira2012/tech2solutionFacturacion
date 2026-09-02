import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<import("./category.entity").Category>;
    findAll(): Promise<import("./category.entity").Category[]>;
    update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<import("./category.entity").Category>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
