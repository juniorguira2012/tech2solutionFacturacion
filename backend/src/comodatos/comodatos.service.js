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
exports.ComodatosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comodato_entity_1 = require("./entities/comodato.entity");
const product_entity_1 = require("../products/entities/product.entity");
let ComodatosService = class ComodatosService {
    comodatosRepository;
    productsRepository;
    constructor(comodatosRepository, productsRepository) {
        this.comodatosRepository = comodatosRepository;
        this.productsRepository = productsRepository;
    }
    async create(createComodatoDto) {
        const producto = await this.productsRepository.findOne({
            where: { id: createComodatoDto.productoId },
        });
        if (!producto) {
            throw new common_1.NotFoundException(`Producto con id ${createComodatoDto.productoId} no encontrado`);
        }
        if (producto.stock < 1) {
            throw new common_1.BadRequestException(`No hay stock disponible del producto ${producto.nombre}`);
        }
        producto.stock -= 1;
        await this.productsRepository.save(producto);
        const comodato = this.comodatosRepository.create({
            ...createComodatoDto,
            estado: createComodatoDto.estado || 'activo',
        });
        const saved = await this.comodatosRepository.save(comodato);
        return await this.findOne(saved.id);
    }
    async findAll() {
        return await this.comodatosRepository.find({
            relations: ['producto', 'usuario'],
            order: { fechaCreacion: 'DESC' }
        });
    }
    async findOne(id) {
        const comodato = await this.comodatosRepository.findOne({
            where: { id },
            relations: ['producto', 'usuario'],
        });
        if (!comodato) {
            throw new common_1.NotFoundException(`Comodato con id ${id} no encontrado`);
        }
        return comodato;
    }
    async update(id, updateComodatoDto) {
        const comodato = await this.findOne(id);
        if (updateComodatoDto.estado === 'devuelto' && comodato.estado !== 'devuelto') {
            const producto = await this.productsRepository.findOne({
                where: { id: comodato.productoId },
            });
            if (producto) {
                producto.stock += 1;
                await this.productsRepository.save(producto);
            }
        }
        await this.comodatosRepository.update(id, updateComodatoDto);
        return this.findOne(id);
    }
    async devolverComodato(id) {
        const comodato = await this.findOne(id);
        if (comodato.estado === 'devuelto') {
            throw new common_1.BadRequestException('El comodato ya ha sido devuelto');
        }
        const producto = await this.productsRepository.findOne({
            where: { id: comodato.productoId },
        });
        if (producto) {
            producto.stock += 1;
            await this.productsRepository.save(producto);
        }
        await this.comodatosRepository.update(id, {
            estado: 'devuelto',
            fechaDevolucion: new Date()
        });
        return this.findOne(id);
    }
    async remove(id) {
        const comodato = await this.findOne(id);
        if (comodato.estado !== 'devuelto') {
            const producto = await this.productsRepository.findOne({
                where: { id: comodato.productoId },
            });
            if (producto) {
                producto.stock += 1;
                await this.productsRepository.save(producto);
            }
        }
        await this.comodatosRepository.delete(id);
    }
};
exports.ComodatosService = ComodatosService;
exports.ComodatosService = ComodatosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comodato_entity_1.Comodato)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ComodatosService);
//# sourceMappingURL=comodatos.service.js.map