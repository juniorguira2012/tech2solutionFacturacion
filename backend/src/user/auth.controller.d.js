import { ConfigService } from '@nestjs/config';
import { UsersService } from '../user/users.service';
import { EmailService } from './email.service';
import { ResetPasswordDto } from '../user/dto/user.dto';
export declare class AuthController {
    private readonly usersService;
    private readonly emailService;
    private readonly configService;
    constructor(usersService: UsersService, emailService: EmailService, configService: ConfigService);
    private googleClient;
    login(body: any): Promise<{
        message: string;
        user: {
            id: number;
            nombre: string;
            email: string;
            rol: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            resetToken?: string;
            resetTokenExpiresAt?: Date;
        };
        access_token: string;
    }>;
    googleLogin(token: string): Promise<{
        message: string;
        user: {
            id: number;
            nombre: string;
            email: string;
            rol: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            resetToken?: string;
            resetTokenExpiresAt?: Date;
        };
        access_token: string;
    }>;
    validateToken(authHeader: string): Promise<{
        success: boolean;
        message: string;
        user: {
            id: number;
            nombre: string;
            email: string;
            rol: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            resetToken?: string;
            resetTokenExpiresAt?: Date;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
