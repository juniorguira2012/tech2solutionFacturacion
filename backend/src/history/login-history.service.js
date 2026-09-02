"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHistoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const login_history_entity_1 = require("./entities/login-history.entity");
let LoginHistoryService = class LoginHistoryService {
    loginHistoryRepository;
    constructor(loginHistoryRepository) {
        this.loginHistoryRepository = loginHistoryRepository;
    }
    async create(createLoginHistoryDto) {
        const newRecord = this.loginHistoryRepository.create(createLoginHistoryDto);
        return this.loginHistoryRepository.save(newRecord);
    }
    async findAll(page = 1, limit = 15) {
        const [data, total] = await this.loginHistoryRepository.findAndCount({
            relations: ['user'],
            order: {
                loginDate: 'DESC',
            },
            take: limit,
            skip: (page - 1) * limit,
        });
        return { data, total, page, limit };
    }
};
exports.LoginHistoryService = LoginHistoryService;
exports.LoginHistoryService = LoginHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(login_history_entity_1.LoginHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LoginHistoryService);
//# sourceMappingURL=login-history.service.js.map