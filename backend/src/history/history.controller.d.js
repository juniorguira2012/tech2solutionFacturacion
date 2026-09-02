import { LoginHistoryService } from './login-history.service';
export declare class HistoryController {
    private readonly loginHistoryService;
    constructor(loginHistoryService: LoginHistoryService);
    getLoginHistory(page: number, limit: number): Promise<{
        data: import("./entities/login-history.entity").LoginHistory[];
        total: number;
        page: number;
        limit: number;
    }>;
}
