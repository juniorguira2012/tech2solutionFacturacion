"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
var common_1 = require("@nestjs/common");
var crypto = require("crypto");
var bcrypt = require("bcryptjs");
var UsersService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UsersService = _classThis = /** @class */ (function () {
        function UsersService_1(usersRepository) {
            this.usersRepository = usersRepository;
        }
        UsersService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var adminEmail;
                var _this = this;
                return __generator(this, function (_a) {
                    adminEmail = 'techtwosolution2@gmail.com';
                    // Agregamos un pequeño delay y try-catch para evitar crash si la tabla no existe aún
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var user, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, this.findByEmail(adminEmail)];
                                case 1:
                                    user = _a.sent();
                                    if (!!user) return [3 /*break*/, 3];
                                    console.log('--- SEEDING: Creando usuario administrador de pruebas ---');
                                    return [4 /*yield*/, this.create({
                                            nombre: 'Admin Test',
                                            email: adminEmail,
                                            password: 'admin123456',
                                            rol: 'admin',
                                            isActive: true,
                                        })];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [3 /*break*/, 5];
                                case 4:
                                    error_1 = _a.sent();
                                    console.warn('--- SEEDING SKIPPED: La tabla "users" no existe todavía o la DB no está lista ---');
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); }, 5000);
                    return [2 /*return*/];
                });
            });
        };
        // Método auxiliar para generar un hash rápido si necesitas actualizar la DB manualmente
        UsersService_1.prototype.getHash = function (password) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, bcrypt.hash(password, 10)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        UsersService_1.prototype.findAll = function () {
            // No seleccionamos el password para el listado general por seguridad
            return this.usersRepository.find({
                select: ['id', 'nombre', 'email', 'rol', 'isActive', 'createdAt']
            });
        };
        UsersService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersRepository.findOne({
                            where: { id: id },
                            select: ['id', 'nombre', 'email', 'rol', 'isActive']
                        })];
                });
            });
        };
        UsersService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usersRepository.findOneBy({ id: id })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException("Usuario con ID ".concat(id, " no encontrado"));
                            }
                            user.isActive = false;
                            return [2 /*return*/, this.usersRepository.save(user)];
                    }
                });
            });
        };
        UsersService_1.prototype.create = function (createUserDto) {
            return __awaiter(this, void 0, void 0, function () {
                var salt, hashedPassword, email, existingUser, restoredUser, newUser, savedUser;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, bcrypt.genSalt(10)];
                        case 1:
                            salt = _b.sent();
                            return [4 /*yield*/, bcrypt.hash(createUserDto.password, salt)];
                        case 2:
                            hashedPassword = _b.sent();
                            email = createUserDto.email.trim().toLowerCase();
                            return [4 /*yield*/, this.usersRepository.findOne({
                                    where: { email: email },
                                })];
                        case 3:
                            existingUser = _b.sent();
                            if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.isActive) {
                                throw new common_1.ConflictException('Ya existe un usuario activo con este correo');
                            }
                            if (!existingUser) return [3 /*break*/, 5];
                            existingUser.nombre = createUserDto.nombre;
                            existingUser.password = hashedPassword;
                            existingUser.rol = createUserDto.rol;
                            existingUser.isActive = (_a = createUserDto.isActive) !== null && _a !== void 0 ? _a : true;
                            return [4 /*yield*/, this.usersRepository.save(existingUser)];
                        case 4:
                            restoredUser = _b.sent();
                            delete restoredUser.password;
                            return [2 /*return*/, restoredUser];
                        case 5:
                            newUser = this.usersRepository.create(__assign(__assign({}, createUserDto), { email: email, password: hashedPassword }));
                            return [4 /*yield*/, this.usersRepository.save(newUser)];
                        case 6:
                            savedUser = _b.sent();
                            delete savedUser.password;
                            return [2 /*return*/, savedUser];
                    }
                });
            });
        };
        UsersService_1.prototype.update = function (id, updateUserDto) {
            return __awaiter(this, void 0, void 0, function () {
                var salt, _a, user, savedUser;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!updateUserDto.password) return [3 /*break*/, 3];
                            return [4 /*yield*/, bcrypt.genSalt(10)];
                        case 1:
                            salt = _b.sent();
                            _a = updateUserDto;
                            return [4 /*yield*/, bcrypt.hash(updateUserDto.password, salt)];
                        case 2:
                            _a.password = _b.sent();
                            _b.label = 3;
                        case 3: return [4 /*yield*/, this.usersRepository.preload(__assign({ id: id }, updateUserDto))];
                        case 4:
                            user = _b.sent();
                            if (!user) {
                                throw new common_1.NotFoundException("Usuario con ID ".concat(id, " no encontrado"));
                            }
                            return [4 /*yield*/, this.usersRepository.save(user)];
                        case 5:
                            savedUser = _b.sent();
                            delete savedUser.password;
                            return [2 /*return*/, savedUser];
                    }
                });
            });
        };
        UsersService_1.prototype.findByEmail = function (email) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersRepository.findOne({
                            where: { email: email },
                            select: ['id', 'nombre', 'email', 'password', 'rol', 'isActive'],
                        })];
                });
            });
        };
        UsersService_1.prototype.generateResetToken = function (email) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usersRepository.findOne({ where: { email: email } })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException('Usuario no registrado');
                            }
                            user.resetToken = crypto.randomBytes(32).toString('hex');
                            user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
                            return [4 /*yield*/, this.usersRepository.save(user)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, user.resetToken];
                    }
                });
            });
        };
        UsersService_1.prototype.findByResetToken = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersRepository
                            .createQueryBuilder('user')
                            .addSelect(['user.resetToken', 'user.resetTokenExpiresAt'])
                            .where('user.resetToken = :token', { token: token })
                            .getOne()];
                });
            });
        };
        UsersService_1.prototype.resetPassword = function (token, password) {
            return __awaiter(this, void 0, void 0, function () {
                var user, salt, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!token || !password) {
                                throw new common_1.BadRequestException('Token y nueva contraseña requeridos');
                            }
                            return [4 /*yield*/, this.findByResetToken(token)];
                        case 1:
                            user = _b.sent();
                            if (!user) {
                                throw new common_1.NotFoundException('Token inválido o expirado');
                            }
                            if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt.getTime() < Date.now()) {
                                throw new common_1.BadRequestException('El token ha expirado');
                            }
                            return [4 /*yield*/, bcrypt.genSalt(10)];
                        case 2:
                            salt = _b.sent();
                            _a = user;
                            return [4 /*yield*/, bcrypt.hash(password, salt)];
                        case 3:
                            _a.password = _b.sent();
                            user.resetToken = undefined;
                            user.resetTokenExpiresAt = undefined;
                            return [4 /*yield*/, this.usersRepository.save(user)];
                        case 4:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return UsersService_1;
    }());
    __setFunctionName(_classThis, "UsersService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersService = _classThis;
}();
exports.UsersService = UsersService;
