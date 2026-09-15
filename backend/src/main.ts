import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.FRONTEND_URL?.split(',') ?? true });
  app.setGlobalPrefix('api');
  app.getHttpAdapter().get('/', (_request, response) => {
    response.json({ status: 'ok', service: 'mini-job-queue-api', jobs: '/api/jobs' });
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
