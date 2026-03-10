import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = configService
        .get("FRONTEND_URL", "http://localhost:5173,http://localhost:5174")
        .split(",");
      
      // Si no hay origin (como en peticiones locales de servidor a servidor) 
      // o el origin está en la lista de permitidos
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix("api");

  const port = configService.get("PORT", 3001);

  await app.listen(port);
}

bootstrap();
