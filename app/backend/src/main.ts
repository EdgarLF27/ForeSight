import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { join } from "path";
import * as express from "express";
import { loggerConfig } from "./common/logger.config";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });

  // USAR FILTRO DE EXCEPCIONES GLOBAL
  app.useGlobalFilters(new AllExceptionsFilter());
  const configService = app.get(ConfigService);

  // Configuración de CORS ultra-compatible
  app.enableCors({
    origin: true, // Permite cualquier origen (temporal para depuración)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  // Forzar cabeceras de seguridad para Google Login en el middleware
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
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
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  app.setGlobalPrefix("api");

  const port = configService.get("PORT", 3001);
  await app.listen(port);
}

bootstrap();
