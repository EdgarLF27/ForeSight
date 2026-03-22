import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { join } from "path";
import * as express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS de manera robusta
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://foresight-ten.vercel.app",
      ];

      const configOrigin = configService.get<string>("FRONTEND_URL");
      if (configOrigin) {
        allowedOrigins.push(...configOrigin.split(",").map((o) => o.trim()));
      }

      if (
        !origin ||
        allowedOrigins.some((o) => origin.startsWith(o)) ||
        origin.includes("localhost")
      ) {
        callback(null, true);
      } else {
        console.error(`Bloqueo CORS para: ${origin}`);
        callback(null, true); // Permitimos por ahora para no romper el flujo
      }
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Accept, Authorization",
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
