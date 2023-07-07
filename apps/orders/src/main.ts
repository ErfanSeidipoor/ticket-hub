import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupApp } from './setup-app';
import { checkEnv } from './checkEnv';

async function bootstrap() {
  checkEnv();
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const globalPrefix = 'api/orders';
  app.setGlobalPrefix(globalPrefix);
  const port = 8004;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: <orders>:${port}/${globalPrefix} !!!`
  );
}

bootstrap();
