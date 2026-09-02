import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../user/dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("./dto/entities/user.entity").User[]>;
    create(createUserDto: CreateUserDto, role: string): Promise<import("./dto/entities/user.entity").User>;
    update(id: number, updateUserDto: UpdateUserDto, role: string): Promise<import("./dto/entities/user.entity").User>;
    remove(id: number, requestorId: string, role: string): Promise<import("./dto/entities/user.entity").User>;
}
