import { ClientsService } from './clients.service';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    findAll(): Promise<import("./entities/client.entity").Client[]>;
    create(clientData: any): Promise<import("./entities/client.entity").Client>;
    update(id: number, clientData: any): Promise<import("./entities/client.entity").Client>;
    remove(id: number): Promise<import("./entities/client.entity").Client>;
}
