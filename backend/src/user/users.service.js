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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./dto/entities/user.entity");
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async onModuleInit() {
        const adminEmail = 'techtwosolution2@gmail.com';
        setTimeout(async () => {
            try {
                const user = await this.findByEmail(adminEmail);
                if (!user) {
                    console.log('--- SEEDING: Creando usuario administrador de pruebas ---');
                    await this.create({
                        nombre: 'Admin Test',
                        email: adminEmail,
                        password: 'admin123456',
                        rol: 'admin',
                        isActive: true,
                    });
                }
            }
            catch (error) {
                console.warn('--- SEEDING SKIPPED: La tabla "users" no existe todavía o la DB no está lista ---');
            }
        }, 5000);
    }
    async getHash(password) {
        return await bcrypt.hash(password, 10);
    }
    findAll() {
        return this.usersRepository.find({
            select: ['id', 'nombre', 'email', 'rol', 'isActive', 'createdAt']
        });
    }
    async findOne(id) {
        return this.usersRepository.findOne({
            where: { id },
            select: ['id', 'nombre', 'email', 'rol', 'isActive']
        });
    }
    async remove(id) {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        user.isActive = false;
        return this.usersRepository.save(user);
    }
    async create(createUserDto) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        const email = createUserDto.email.trim().toLowerCase();
        const existingUser = await this.usersRepository.findOne({
            where: { email },
        });
        if (existingUser?.isActive) {
            throw new common_1.ConflictException('Ya existe un usuario activo con este correo');
        }
        if (existingUser) {
            existingUser.nombre = createUserDto.nombre;
            existingUser.password = hashedPassword;
            existingUser.rol = createUserDto.rol;
            existingUser.isActive = createUserDto.isActive ?? true;
            const restoredUser = await this.usersRepository.save(existingUser);
            delete restoredUser.password;
            return restoredUser;
        }
        const newUser = this.usersRepository.create({
            ...createUserDto,
            email,
            password: hashedPassword,
        });
        const savedUser = await this.usersRepository.save(newUser);
        delete savedUser.password;
        return savedUser;
    }
    async update(id, updateUserDto) {
        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt(10);
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
        }
        const user = await this.usersRepository.preload({
            id: id,
            ...updateUserDto,
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        const savedUser = await this.usersRepository.save(user);
        delete savedUser.password;
        return savedUser;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'nombre', 'email', 'password', 'rol', 'isActive'],
        });
    }
    async generateResetToken(email) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no registrado');
        }
        user.resetToken = crypto.randomBytes(32).toString('hex');
        user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.usersRepository.save(user);
        return user.resetToken;
    }
    async findByResetToken(token) {
        return this.usersRepository
            .createQueryBuilder('user')
            .addSelect(['user.resetToken', 'user.resetTokenExpiresAt'])
            .where('user.resetToken = :token', { token })
            .getOne();
    }
    async resetPassword(token, password) {
        if (!token || !password) {
            throw new common_1.BadRequestException('Token y nueva contraseña requeridos');
        }
        const user = await this.findByResetToken(token);
        if (!user) {
            throw new common_1.NotFoundException('Token inválido o expirado');
        }
        if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt.getTime() < Date.now()) {
            throw new common_1.BadRequestException('El token ha expirado');
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetToken = undefined;
        user.resetTokenExpiresAt = undefined;
        await this.usersRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map