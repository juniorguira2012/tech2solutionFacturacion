export declare class User {
    id: number;
    nombre: string;
    email: string;
    password: string;
    rol: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    resetToken?: string;
    resetTokenExpiresAt?: Date;
}
