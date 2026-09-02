import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
export declare class RolesService {
    private readonly roleRepository;
    constructor(roleRepository: Repository<Role>);
    findAll(): Promise<Role[]>;
    updateConfig(name: string, config: any): Promise<Role>;
}
