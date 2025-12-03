import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:9090'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-business-id', 'x-user-id']
  });
  
  app.use(json({ limit: '1mb' }));
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}/api`);
}

bootstrap();
