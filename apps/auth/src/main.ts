import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { checkEnv } from './checkEnv';

async function bootstrap() {
  checkEnv();
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
  // somewhere in your initialization file
  app.use(cookieParser());
  const globalPrefix = 'api/auth';
  app.setGlobalPrefix(globalPrefix);
  const port = 8001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: <auth>:${port}/${globalPrefix} !!!`
  );
}

bootstrap();
