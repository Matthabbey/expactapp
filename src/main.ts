declare const module: any;
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { AllExceptionsFilter } from './middlewares/allException.filter';
import { PaginationService } from './pagination/pagination.service';
import { PaginationInterceptor } from './pagination/pagination.interceptor';

async function bootstrap() {
  dotenv.config(); // Load environment variables from .env file
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
    forceCloseConnections: true,
  });
  app.enableShutdownHooks();
  // app.enableCors();
  app.enableCors({
    origin: [
      'http://localhost:8000',
      'http://localhost:8080',
      'http://example.com',
      'http://www.example.com',
      'http://app.example.com',
      'https://example.com',
      'https://www.example.com',
      'https://app.example.com',
    ],
    methods: ['GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'],
    credentials: true,
  });
  // app.useGlobalGuards(new RolesGuard());
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('auth')
    .setDescription('API Descriptions')
    .setVersion('1.0')
    .addServer(`http://localhost:${process.env.PORT}`)
    .addServer(`http://localhost:8080`)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));
  SwaggerModule.setup('/doc', app, document);
  app.useGlobalInterceptors(
    new PaginationInterceptor(new PaginationService(), 'data'),
  );
  app.useGlobalPipes(new ValidationPipe());
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  // app.useGlobalFilters(new HttpExceptionFilter()); // Register the custom exception filter

  await app.listen(process.env.PORT || 8000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
