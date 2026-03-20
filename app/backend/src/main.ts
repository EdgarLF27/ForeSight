import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { join } from 'path';
import * as express from 'express';
import { loggerConfig } from './common/logger.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });
  
  // USAR FILTRO DE EXCEPCIONES GLOBAL
  app.useGlobalFilters(new AllExceptionsFilter());
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = configService
        .get("FRONTEND_URL", "http://localhost:5173,http://localhost:5174")
        .split(",");
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // SERVIR ARCHIVOS ESTÁTICOS CORRECTAMENTE
  // join(__dirname, '..', '..', 'uploads') apunta a la raíz de /backend/uploads cuando corre desde /dist
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  app.setGlobalPrefix("api");

  const port = configService.get("PORT", 3001);
  await app.listen(port);
}

bootstrap();
