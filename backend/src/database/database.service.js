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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
// src/database/database.service.ts
var common_1 = require("@nestjs/common");
var schedule_1 = require("@nestjs/schedule"); // 🌟 Motor de tareas programadas
var child_process_1 = require("child_process");
var fs = require("fs");
var path = require("path");
var DatabaseService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleAutomaticBackup_decorators;
    var DatabaseService = _classThis = /** @class */ (function () {
        function DatabaseService_1() {
            // Inicializamos el logger para ver los reportes en los logs de Portainer
            this.logger = (__runInitializers(this, _instanceExtraInitializers), new common_1.Logger(DatabaseService.name));
        }
        // ⏱️ TAREA PROGRAMADA 
        DatabaseService_1.prototype.handleAutomaticBackup = function () {
            return __awaiter(this, void 0, void 0, function () {
                var filePath, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log('🚀 [CRON] Iniciando el proceso de backup automático diario...');
                            filePath = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, 5, 6]);
                            return [4 /*yield*/, this.generateBackupFile()];
                        case 2:
                            // 1. Generar el archivo .sql en la carpeta /tmp
                            filePath = _a.sent();
                            this.logger.log("[CRON] Archivo temporal generado con \u00E9xito en: ".concat(filePath));
                            // 2. Subir el archivo generado a Nextcloud
                            return [4 /*yield*/, this.uploadToNextcloud(filePath)];
                        case 3:
                            // 2. Subir el archivo generado a Nextcloud
                            _a.sent();
                            this.logger.log('[CRON] ☁️ ¡Respaldo subido a la nube de OneRedRD correctamente!');
                            return [3 /*break*/, 6];
                        case 4:
                            error_1 = _a.sent();
                            this.logger.error("[CRON] \u274C Fall\u00F3 el respaldo autom\u00E1tico: ".concat(error_1.message || error_1));
                            return [3 /*break*/, 6];
                        case 5:
                            // 3. LIMPIEZA: Eliminamos el archivo de /tmp para no saturar el almacenamiento del contenedor
                            if (filePath && fs.existsSync(filePath)) {
                                try {
                                    fs.unlinkSync(filePath);
                                    this.logger.log('[CRON] 🗑️ Archivo temporal de /tmp eliminado para cuidar espacio.');
                                }
                                catch (cleanupError) {
                                    this.logger.error("[CRON] \u26A0\uFE0F No se pudo limpiar el archivo temporal: ".concat(cleanupError.message));
                                }
                            }
                            return [7 /*endfinally*/];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        // --- TUS FUNCIONES EN JUEGO ---
        DatabaseService_1.prototype.generateBackupFile = function () {
            return __awaiter(this, void 0, void 0, function () {
                var timestamp, fileName, filePath, host, user, database, password;
                return __generator(this, function (_a) {
                    timestamp = new Date().toISOString().split('T')[0];
                    fileName = "backup-tech2solution-".concat(timestamp, "-").concat(Date.now(), ".sql");
                    filePath = path.join('/tmp', fileName);
                    host = process.env.DATABASE_HOST || 'postgres_test';
                    user = process.env.DATABASE_USER || 'postgres';
                    database = process.env.DATABASE_NAME || 'tech_two_solution_db_test';
                    password = process.env.DATABASE_PASSWORD || 'tech2_pass_2024';
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (0, child_process_1.exec)("PGPASSWORD=\"".concat(password, "\" pg_dump -h ").concat(host, " -U ").concat(user, " -d ").concat(database, " -F p -f ").concat(filePath), function (error, stdout, stderr) {
                                if (error) {
                                    return reject(new common_1.InternalServerErrorException("Error ejecutando pg_dump: ".concat(stderr || error.message)));
                                }
                                resolve(filePath);
                            });
                        })];
                });
            });
        };
        DatabaseService_1.prototype.uploadToNextcloud = function (filePath) {
            return __awaiter(this, void 0, void 0, function () {
                var fileName, nextcloudUser, nextcloudToken, url, fileBuffer, authHeader, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fileName = path.basename(filePath);
                            nextcloudUser = process.env.NEXTCLOUD_USER;
                            nextcloudToken = process.env.NEXTCLOUD_APP_PASSWORD;
                            url = "https://nube.oneredrd.com/remote.php/dav/files/".concat(nextcloudUser, "/Backup-Techsolution/").concat(fileName);
                            fileBuffer = fs.readFileSync(filePath);
                            authHeader = Buffer.from("".concat(nextcloudUser, ":").concat(nextcloudToken)).toString('base64');
                            return [4 /*yield*/, fetch(url, {
                                    method: 'PUT',
                                    body: fileBuffer,
                                    headers: {
                                        'Authorization': "Basic ".concat(authHeader),
                                        'Content-Type': 'application/octet-stream',
                                    },
                                })];
                        case 1:
                            response = _a.sent();
                            if (!response.ok) {
                                throw new Error("Error en la nube de OneRedRD: ".concat(response.statusText));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        return DatabaseService_1;
    }());
    __setFunctionName(_classThis, "DatabaseService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleAutomaticBackup_decorators = [(0, schedule_1.Cron)('30 1 * * *')];
        __esDecorate(_classThis, null, _handleAutomaticBackup_decorators, { kind: "method", name: "handleAutomaticBackup", static: false, private: false, access: { has: function (obj) { return "handleAutomaticBackup" in obj; }, get: function (obj) { return obj.handleAutomaticBackup; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DatabaseService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DatabaseService = _classThis;
}();
exports.DatabaseService = DatabaseService;
