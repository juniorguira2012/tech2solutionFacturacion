import * as express from 'express';
import { DatabaseService } from './database.service';
export declare class DatabaseController {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    downloadAndCloudBackup(res: express.Response): Promise<void>;
}
