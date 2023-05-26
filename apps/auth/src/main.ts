/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger,ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: true,
    })
  );

  const globalPrefix = 'api/auth';
  app.setGlobalPrefix(globalPrefix);
  const port = 8001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://${process.env["DOMAIN"]}/${globalPrefix} !!!`
  );
}

bootstrap();