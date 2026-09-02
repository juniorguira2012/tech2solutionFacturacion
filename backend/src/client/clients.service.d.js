import { Repository } from 'typeorm';
import { Client } from '../client/entities/client.entity';
export declare class ClientsService {
    private clientsRepository;
    constructor(clientsRepository: Repository<Client>);
    findAll(): Promise<Client[]>;
    create(clientData: Partial<Client>): Promise<Client>;
    update(id: number, clientData: Partial<Client>): Promise<Client>;
    remove(id: number): Promise<Client>;
}
