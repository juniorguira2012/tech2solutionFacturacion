import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './dto/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersService implements OnModuleInit {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    getHash(password: string): Promise<string>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User | null>;
    remove(id: number): Promise<User>;
    create(createUserDto: CreateUserDto): Promise<User>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    generateResetToken(email: string): Promise<string>;
    findByResetToken(token: string): Promise<User | null>;
    resetPassword(token: string, password: string): Promise<void>;
}
