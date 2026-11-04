// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.getHttpAdapter().getInstance().set('etag', false);
  app.setGlobalPrefix('api');

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
  ].filter(Boolean);

  // Configuración de CORS blindada para desarrollo local y subdominios
app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isLocalViteOrigin =
        /^http:\/\/([a-zA-Z0-9-]+\.)*localhost:\d+$/.test(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||
        /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin) ||
        /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/.test(origin);

      const isTech2SolutionDomain = 
        /^https?:\/\/([a-zA-Z0-9-]+\.)*tech2solution\.com(:\d+)?$/.test(origin);

      if (isLocalViteOrigin || isTech2SolutionDomain) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    // 👈 Agregamos x-user-role junto con las demás
    allowedHeaders: 'Content-Type, Accept, Authorization, x-tenant-id, x-tenant-subdomain, x-user-id, x-user-role, x-inventory-permission',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000, '0.0.0.0');
  console.log(`Backend corriendo en: http://localhost:3000`);
}
bootstrap();