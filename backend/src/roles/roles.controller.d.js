import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    getRoles(): Promise<import("./entities/role.entity").Role[]>;
    updateConfig(body: {
        name: string;
        config: any;
    }): Promise<import("./entities/role.entity").Role>;
}
