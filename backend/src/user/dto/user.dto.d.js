export declare class CreateUserDto {
    nombre: string;
    email: string;
    password: string;
    rol: string;
    isActive?: boolean;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
export declare class UpdateUserDto {
    nombre?: string;
    email?: string;
    password?: string;
    rol?: string;
    isActive?: boolean;
}
