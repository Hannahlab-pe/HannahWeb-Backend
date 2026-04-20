import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir localhost en cualquier puerto (desarrollo) + la URL de producción configurada
      const prodUrl = process.env.FRONTEND_URL;
      const isLocalhost = !origin || /^https?:\/\/localhost(:\d+)?$/.test(origin);
      const isProd = prodUrl && origin === prodUrl;
      if (isLocalhost || isProd) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para origen: ${origin}`));
      }
    },
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en http://localhost:${port}/api/v1`);
}
bootstrap();
