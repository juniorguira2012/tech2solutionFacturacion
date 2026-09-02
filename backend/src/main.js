"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@nestjs/core");
var common_1 = require("@nestjs/common");
var app_module_1 = require("./app.module");
var express_1 = require("express");
// backend/src/main.ts
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        var app, allowedOrigins;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core_1.NestFactory.create(app_module_1.AppModule)];
                case 1:
                    app = _a.sent();
                    app.setGlobalPrefix('api');
                    // Aumentar límites para soportar imágenes en Base64
                    app.use((0, express_1.json)({ limit: '50mb' }));
                    app.use((0, express_1.urlencoded)({ limit: '50mb', extended: true }));
                    allowedOrigins = [
                        process.env.FRONTEND_URL,
                        process.env.CORS_ORIGIN,
                        'https://inventario.oneredrd.com',
                        'http://localhost:5173',
                        'http://127.0.0.1:5173',
                    ].filter(Boolean);
                    console.log('Allowed CORS origins:', allowedOrigins);
                    app.enableCors({
                        origin: function (origin, callback) {
                            var isLocalViteOrigin = !origin ||
                                /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
                                /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||
                                /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin) ||
                                /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/.test(origin);
                            if (isLocalViteOrigin || allowedOrigins.includes(origin)) {
                                callback(null, true);
                                return;
                            }
                            callback(new Error("Origen no permitido por CORS: ".concat(origin)));
                        },
                        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                        credentials: true,
                    });
                    app.useGlobalPipes(new common_1.ValidationPipe({
                        transform: true,
                        whitelist: true,
                        forbidNonWhitelisted: true,
                    }));
                    return [4 /*yield*/, app.listen(3000, '0.0.0.0')];
                case 2:
                    _a.sent(); // Escuchar en todas las interfaces de red locales
                    return [2 /*return*/];
            }
        });
    });
}
bootstrap();
