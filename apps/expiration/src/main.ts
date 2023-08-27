import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { checkEnv } from './checkEnv';

async function bootstrap() {
  checkEnv();
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/expiration';
  app.setGlobalPrefix(globalPrefix);
  const port = 8005;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: <expiration>:${port}/${globalPrefix}`
  );
}

bootstrap();
