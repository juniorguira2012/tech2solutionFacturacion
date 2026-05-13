import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

// backend/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumentar límites para soportar imágenes en Base64
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ].filter(Boolean);

      const isLocalViteOrigin =
        !origin ||
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
    credentials: true, // Permitir el envío de cookies de origen cruzado
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(3000, '0.0.0.0'); // Escuchar en todas las interfaces de red locales
}
bootstrap();
