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

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      const configOrigins = configService.get<string>("FRONTEND_URL", "");
      const allowedOrigins = configOrigins
        .split(",")
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const defaultOrigins = ["http://localhost:5173", "http://localhost:5174", "https://foresight-ten.vercel.app"];
      const finalAllowed = [...new Set([...allowedOrigins, ...defaultOrigins])];

      if (!origin || finalAllowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Middleware para COOP y COEP (Solución definitiva al error de Google)
  app.use((req, res, next) => {
    res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
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
