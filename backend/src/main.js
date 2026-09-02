"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const express_1 = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ limit: '50mb', extended: true }));
    const rawOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGIN]
        .flatMap((url) => (url ? url.split(',').map((item) => item.trim()) : []));
    const allowedOrigins = Array.from(new Set(rawOrigins));
    console.log('Orígenes CORS autorizados:', allowedOrigins);
    app.enableCors({
        origin: (origin, callback) => {
            const isLocalViteOrigin = !origin ||
                /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
                /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||
                /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin) ||
                /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/.test(origin);
            if (isLocalViteOrigin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error(`Origen no permitido por CORS: ${origin}`));
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map