import { ProvidersService } from './providers.service';
export declare class ProvidersController {
    private readonly providersService;
    constructor(providersService: ProvidersService);
    create(createProviderDto: any): Promise<import("./entities/provider.entity").Provider[]>;
    findAll(): Promise<import("./entities/provider.entity").Provider[]>;
    update(id: number, updateProviderDto: any): Promise<import("./entities/provider.entity").Provider>;
    remove(id: number): Promise<import("./entities/provider.entity").Provider>;
}
