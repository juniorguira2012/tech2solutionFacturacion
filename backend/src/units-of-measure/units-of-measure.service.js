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
exports.UnitsOfMeasureService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const units_of_measure_entity_1 = require("./entities/units-of-measure.entity");
let UnitsOfMeasureService = class UnitsOfMeasureService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(createDto) {
        const existe = await this.repository.findOne({ where: { codigo: createDto.codigo } });
        if (existe) {
            throw new common_1.ConflictException(`El código de unidad '${createDto.codigo}' ya está registrado.`);
        }
        const nuevaUnidad = this.repository.create(createDto);
        return await this.repository.save(nuevaUnidad);
    }
    async findAll() {
        return await this.repository.find({
            order: { nombre: 'ASC' },
        });
    }
    async findOne(id) {
        const unidad = await this.repository.findOne({ where: { id } });
        if (!unidad) {
            throw new common_1.NotFoundException(`Unidad de medida con ID ${id} no encontrada.`);
        }
        return unidad;
    }
    async update(id, updateDto) {
        const unidad = await this.findOne(id);
        const editada = this.repository.merge(unidad, updateDto);
        return await this.repository.save(editada);
    }
    async remove(id) {
        const unidad = await this.findOne(id);
        await this.repository.remove(unidad);
        return { deleted: true, id };
    }
};
exports.UnitsOfMeasureService = UnitsOfMeasureService;
exports.UnitsOfMeasureService = UnitsOfMeasureService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(units_of_measure_entity_1.UnidadMedida)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UnitsOfMeasureService);
//# sourceMappingURL=units-of-measure.service.js.map