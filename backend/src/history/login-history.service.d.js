import { Repository } from 'typeorm';
import { LoginHistory } from './entities/login-history.entity';
import { CreateLoginHistoryDto } from './dto/create-login-history.dto';
export declare class LoginHistoryService {
    private readonly loginHistoryRepository;
    constructor(loginHistoryRepository: Repository<LoginHistory>);
    create(createLoginHistoryDto: CreateLoginHistoryDto): Promise<LoginHistory>;
    findAll(page?: number, limit?: number): Promise<{
        data: LoginHistory[];
        total: number;
        page: number;
        limit: number;
    }>;
}
