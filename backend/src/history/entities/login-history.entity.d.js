import { User } from '../../user/dto/entities/user.entity';
export declare class LoginHistory {
    id: number;
    userId: number;
    userIdentifier: string;
    loginDate: Date;
    ipAddress: string;
    userAgent: string;
    user: User;
}
