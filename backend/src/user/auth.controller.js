"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
var common_1 = require("@nestjs/common");
var google_auth_library_1 = require("google-auth-library");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var AuthController = function () {
    var _classDecorators = [(0, common_1.Controller)('auth')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _login_decorators;
    var _googleLogin_decorators;
    var _validateToken_decorators;
    var _forgotPassword_decorators;
    var _resetPassword_decorators;
    var AuthController = _classThis = /** @class */ (function () {
        function AuthController_1(usersService, emailService, configService) {
            this.usersService = (__runInitializers(this, _instanceExtraInitializers), usersService);
            this.emailService = emailService;
            this.configService = configService;
            // Inicializamos el cliente de Google en el constructor
            this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
        }
        AuthController_1.prototype.login = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var user, isPasswordValid, payload, password, userWithoutPassword, tokenGenerado;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usersService.findByEmail(body.email)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.UnauthorizedException('Credenciales inválidas');
                            }
                            if (user.isActive === false) {
                                throw new common_1.UnauthorizedException('Usuario suspendido por administración');
                            }
                            return [4 /*yield*/, bcrypt.compare(body.password, user.password)];
                        case 2:
                            isPasswordValid = _a.sent();
                            if (!isPasswordValid) {
                                throw new common_1.UnauthorizedException('Credenciales inválidas');
                            }
                            payload = {
                                id: user.id,
                                email: user.email,
                                rol: user.rol
                            };
                            password = user.password, userWithoutPassword = __rest(user, ["password"]);
                            tokenGenerado = jwt.sign(payload, this.configService.getOrThrow('JWT_SECRET'), // 💡 CORRECCIÓN: Usamos ConfigService para consistencia
                            { expiresIn: '7d' } //Aumentado de 1 día a 7 días
                            );
                            return [2 /*return*/, {
                                    message: 'Login exitoso',
                                    user: userWithoutPassword,
                                    access_token: tokenGenerado, // 👈 ¡Pasaporte emitido con éxito!
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.googleLogin = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                var ticket, googlePayload, user, localPayload, accessToken, password, userWithoutPassword, error_1;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, this.googleClient.verifyIdToken({
                                    idToken: token,
                                    audience: this.configService.get('GOOGLE_CLIENT_ID'),
                                })];
                        case 1:
                            ticket = _d.sent();
                            googlePayload = ticket.getPayload();
                            if (!googlePayload || !googlePayload.email) {
                                throw new common_1.UnauthorizedException('Token de Google inválido o sin email.');
                            }
                            return [4 /*yield*/, this.usersService.findByEmail(googlePayload.email)];
                        case 2:
                            user = _d.sent();
                            if (!!user) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.usersService.create({
                                    email: googlePayload.email,
                                    nombre: (_c = (_a = googlePayload.name) !== null && _a !== void 0 ? _a : (_b = googlePayload.email) === null || _b === void 0 ? void 0 : _b.split('@')[0]) !== null && _c !== void 0 ? _c : 'Usuario Google',
                                    password: "google_".concat(Date.now()), // Contraseña aleatoria, no se usará
                                    rol: 'vendedor', // Rol por defecto para nuevos usuarios
                                    isActive: true,
                                })];
                        case 3:
                            // Si no existe, lo creamos con datos de Google
                            user = _d.sent();
                            _d.label = 4;
                        case 4:
                            if (user.isActive === false) {
                                throw new common_1.UnauthorizedException('Tu cuenta ha sido suspendida por un administrador.');
                            }
                            localPayload = { id: user.id, email: user.email, rol: user.rol };
                            accessToken = jwt.sign(localPayload, this.configService.getOrThrow('JWT_SECRET'), { expiresIn: '7d' });
                            password = user.password, userWithoutPassword = __rest(user, ["password"]);
                            return [2 /*return*/, {
                                    message: 'Login con Google exitoso',
                                    user: userWithoutPassword,
                                    access_token: accessToken,
                                }];
                        case 5:
                            error_1 = _d.sent();
                            throw new common_1.UnauthorizedException('Falló la autenticación con Google: ' + error_1.message);
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        AuthController_1.prototype.validateToken = function (authHeader) {
            return __awaiter(this, void 0, void 0, function () {
                var token, secret, payload, user, password, userWithoutPassword, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // 1. Verificamos que el header exista y tenga el formato Bearer
                            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                                throw new common_1.UnauthorizedException('No se ha proporcionado un token de acceso válido');
                            }
                            token = authHeader.split(' ')[1];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            secret = this.configService.getOrThrow('JWT_SECRET');
                            payload = jwt.verify(token, secret);
                            return [4 /*yield*/, this.usersService.findByEmail(payload.email)];
                        case 2:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.UnauthorizedException('El usuario ya no existe en el sistema');
                            }
                            if (user.isActive === false) {
                                throw new common_1.UnauthorizedException('Tu cuenta ha sido suspendida por un administrador');
                            }
                            password = user.password, userWithoutPassword = __rest(user, ["password"]);
                            // 🌟 Retornamos un 200 con éxito y el usuario fresco de la base de datos
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Token válido',
                                    user: userWithoutPassword,
                                }];
                        case 3:
                            error_2 = _a.sent();
                            // 🚨 CUALQUIER fallo (token expirado, alterado, etc.) devuelve un 401 limpio en vez de un Crash 500
                            throw new common_1.UnauthorizedException('Token inválido o expirado: ' + error_2.message);
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        AuthController_1.prototype.forgotPassword = function (email) {
            return __awaiter(this, void 0, void 0, function () {
                var token, frontendUrl, resetUrl, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!email) {
                                throw new common_1.BadRequestException('El correo es requerido');
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, this.usersService.generateResetToken(email)];
                        case 2:
                            token = _a.sent();
                            frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5174');
                            resetUrl = "".concat(frontendUrl.replace(/\/$/, ''), "/reset-password?token=").concat(token);
                            return [4 /*yield*/, this.emailService.sendResetPasswordEmail(email, resetUrl)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            error_3 = _a.sent();
                            common_1.Logger.error('Error en forgot-password', error_3, AuthController.name);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/, {
                                message: 'Si el correo existe, se envió un enlace para restablecer la contraseña.',
                            }];
                    }
                });
            });
        };
        AuthController_1.prototype.resetPassword = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usersService.resetPassword(body.token, body.password)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { message: 'Contraseña actualizada correctamente' }];
                    }
                });
            });
        };
        return AuthController_1;
    }());
    __setFunctionName(_classThis, "AuthController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _login_decorators = [(0, common_1.Post)('login')];
        _googleLogin_decorators = [(0, common_1.Post)('google-login')];
        _validateToken_decorators = [(0, common_1.Post)('validate-token')];
        _forgotPassword_decorators = [(0, common_1.Post)('forgot-password')];
        _resetPassword_decorators = [(0, common_1.Post)('reset-password')];
        __esDecorate(_classThis, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: function (obj) { return "login" in obj; }, get: function (obj) { return obj.login; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _googleLogin_decorators, { kind: "method", name: "googleLogin", static: false, private: false, access: { has: function (obj) { return "googleLogin" in obj; }, get: function (obj) { return obj.googleLogin; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _validateToken_decorators, { kind: "method", name: "validateToken", static: false, private: false, access: { has: function (obj) { return "validateToken" in obj; }, get: function (obj) { return obj.validateToken; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _forgotPassword_decorators, { kind: "method", name: "forgotPassword", static: false, private: false, access: { has: function (obj) { return "forgotPassword" in obj; }, get: function (obj) { return obj.forgotPassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resetPassword_decorators, { kind: "method", name: "resetPassword", static: false, private: false, access: { has: function (obj) { return "resetPassword" in obj; }, get: function (obj) { return obj.resetPassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthController = _classThis;
}();
exports.AuthController = AuthController;
