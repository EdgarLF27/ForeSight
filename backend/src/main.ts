import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors(); 
  
  // ACTIVACIÓN DE VALIDACIONES
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,      // Elimina campos que no estén en nuestro "molde" (DTO)
    forbidNonWhitelisted: true, // Da error si envían campos extraños
    transform: true,      // Convierte los datos a los tipos que definamos (ej: string a number)
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
