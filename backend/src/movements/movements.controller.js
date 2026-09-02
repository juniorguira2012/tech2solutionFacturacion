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
exports.MovementsController = void 0;
const common_1 = require("@nestjs/common");
const movements_service_1 = require("./movements.service");
const create_movement_dto_1 = require("./dto/create-movement.dto");
const create_bulk_movement_dto_1 = require("./dto/create-bulk-movement.dto");
const assign_serials_dto_1 = require("./dto/assign-serials.dto");
let MovementsController = class MovementsController {
    movementsService;
    constructor(movementsService) {
        this.movementsService = movementsService;
    }
    create(createMovementDto) {
        return this.movementsService.create(createMovementDto);
    }
    transferBulk(transferData) {
        return this.movementsService.transferBulk(transferData);
    }
    createBulk(bulkData) {
        return this.movementsService.createBulk(bulkData);
    }
    assignToTechnician(assignData) {
        return this.movementsService.assignSerialsToTechnician(assignData);
    }
    returnFromTechnician(payload) {
        const userId = payload.usuarioId || '1';
        return this.movementsService.returnSerialFromTechnician({ serialNumber: payload.serialNumber, nota: payload.nota }, String(userId));
    }
    findTechnicians() {
        return this.movementsService.findTechnicians();
    }
    createTechnician(payload) {
        return this.movementsService.createTechnician(payload);
    }
    updateTechnician(id, payload) {
        return this.movementsService.updateTechnician(id, payload);
    }
    deleteTechnician(id) {
        return this.movementsService.deleteTechnician(id);
    }
    findAll(productoId, page = '1', limit = '50') {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 50;
        if (productoId) {
            return this.movementsService.findByProductId(Number(productoId), pageNum, limitNum);
        }
        return this.movementsService.findAll(undefined, pageNum, limitNum);
    }
    findByProduct(id, page = '1', limit = '50') {
        return this.movementsService.findByProductId(id, Number(page) || 1, Number(limit) || 50);
    }
    async findBySerialNumber(serialNumber) {
        if (!serialNumber) {
            throw new common_1.NotFoundException('Número de serial no proporcionado.');
        }
        return this.movementsService.findBySerialNumber(serialNumber);
    }
};
exports.MovementsController = MovementsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_movement_dto_1.CreateMovementDto]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('transfer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "transferBulk", null);
__decorate([
    (0, common_1.Post)('bulk-receive'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bulk_movement_dto_1.CreateBulkMovementDto]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Post)('assign-to-technician'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_serials_dto_1.AssignSerialsToTechnicianDto]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "assignToTechnician", null);
__decorate([
    (0, common_1.Post)('return-from-technician'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "returnFromTechnician", null);
__decorate([
    (0, common_1.Get)('technicians'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "findTechnicians", null);
__decorate([
    (0, common_1.Post)('technicians'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "createTechnician", null);
__decorate([
    (0, common_1.Patch)('technicians/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "updateTechnician", null);
__decorate([
    (0, common_1.Delete)('technicians/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "deleteTechnician", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('productoId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('product/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "findByProduct", null);
__decorate([
    (0, common_1.Get)('by-serial/:serialNumber'),
    __param(0, (0, common_1.Param)('serialNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MovementsController.prototype, "findBySerialNumber", null);
exports.MovementsController = MovementsController = __decorate([
    (0, common_1.Controller)('movements'),
    __metadata("design:paramtypes", [movements_service_1.MovementsService])
], MovementsController);
//# sourceMappingURL=movements.controller.js.map