import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:5173'),
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = configService.get('PORT', 3001);
  
  await app.listen(port);
  
  console.log(`
🚀 TicketClass Backend is running!
📡 API URL: http://localhost:${port}/api
🔧 Environment: ${configService.get('NODE_ENV', 'development')}
  `);
}

bootstrap();
