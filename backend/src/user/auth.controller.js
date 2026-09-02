"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const google_auth_library_1 = require("google-auth-library");
const users_service_1 = require("../user/users.service");
const email_service_1 = require("./email.service");
const user_dto_1 = require("../user/dto/user.dto");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
let AuthController = AuthController_1 = class AuthController {
    usersService;
    emailService;
    configService;
    constructor(usersService, emailService, configService) {
        this.usersService = usersService;
        this.emailService = emailService;
        this.configService = configService;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
    }
    googleClient;
    async login(body) {
        const user = await this.usersService.findByEmail(body.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (user.isActive === false) {
            throw new common_1.UnauthorizedException('Usuario suspendido por administración');
        }
        const isPasswordValid = await bcrypt.compare(body.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const payload = {
            id: user.id,
            email: user.email,
            rol: user.rol
        };
        const { password, ...userWithoutPassword } = user;
        const tokenGenerado = jwt.sign(payload, this.configService.getOrThrow('JWT_SECRET'), { expiresIn: '7d' });
        return {
            message: 'Login exitoso',
            user: userWithoutPassword,
            access_token: tokenGenerado,
        };
    }
    async googleLogin(token) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const googlePayload = ticket.getPayload();
            if (!googlePayload || !googlePayload.email) {
                throw new common_1.UnauthorizedException('Token de Google inválido o sin email.');
            }
            let user = await this.usersService.findByEmail(googlePayload.email);
            if (!user) {
                user = await this.usersService.create({
                    email: googlePayload.email,
                    nombre: googlePayload.name ?? googlePayload.email?.split('@')[0] ?? 'Usuario Google',
                    password: `google_${Date.now()}`,
                    rol: 'vendedor',
                    isActive: true,
                });
            }
            if (user.isActive === false) {
                throw new common_1.UnauthorizedException('Tu cuenta ha sido suspendida por un administrador.');
            }
            const localPayload = { id: user.id, email: user.email, rol: user.rol };
            const accessToken = jwt.sign(localPayload, this.configService.getOrThrow('JWT_SECRET'), { expiresIn: '7d' });
            const { password, ...userWithoutPassword } = user;
            return {
                message: 'Login con Google exitoso',
                user: userWithoutPassword,
                access_token: accessToken,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Falló la autenticación con Google: ' + error.message);
        }
    }
    async validateToken(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('No se ha proporcionado un token de acceso válido');
        }
        const token = authHeader.split(' ')[1];
        try {
            const secret = this.configService.getOrThrow('JWT_SECRET');
            const payload = jwt.verify(token, secret);
            const user = await this.usersService.findByEmail(payload.email);
            if (!user) {
                throw new common_1.UnauthorizedException('El usuario ya no existe en el sistema');
            }
            if (user.isActive === false) {
                throw new common_1.UnauthorizedException('Tu cuenta ha sido suspendida por un administrador');
            }
            const { password, ...userWithoutPassword } = user;
            return {
                success: true,
                message: 'Token válido',
                user: userWithoutPassword,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido o expirado: ' + error.message);
        }
    }
    async forgotPassword(email) {
        if (!email) {
            throw new common_1.BadRequestException('El correo es requerido');
        }
        try {
            const token = await this.usersService.generateResetToken(email);
            const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5174');
            const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
            await this.emailService.sendResetPasswordEmail(email, resetUrl);
        }
        catch (error) {
            common_1.Logger.error('Error en forgot-password', error, AuthController_1.name);
        }
        return {
            message: 'Si el correo existe, se envió un enlace para restablecer la contraseña.',
        };
    }
    async resetPassword(body) {
        await this.usersService.resetPassword(body.token, body.password);
        return { message: 'Contraseña actualizada correctamente' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('google-login'),
    __param(0, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Post)('validate-token'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        email_service_1.EmailService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map