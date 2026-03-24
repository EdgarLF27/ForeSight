import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuración de CORS Robusta
  app.enableCors({
    origin: true, // En desarrollo permitimos todo, en prod puedes poner un array con tus dominios
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Prefijo global para la API
  app.setGlobalPrefix("api");

  // Pipes de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro de excepciones global
  app.useGlobalFilters(new AllExceptionsFilter());

  // Servir archivos estáticos (Avatares, Logos)
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

  // Headers de seguridad manuales para compatibilidad con Google Login
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });
}
bootstrap();
