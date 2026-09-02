import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
export declare class ProvidersService {
    private readonly providerRepository;
    constructor(providerRepository: Repository<Provider>);
    create(createProviderDto: any): Promise<Provider[]>;
    findAll(): Promise<Provider[]>;
    update(id: number, updateProviderDto: any): Promise<Provider>;
    remove(id: number): Promise<Provider>;
}
