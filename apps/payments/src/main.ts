import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupApp } from './setup-app';
import { checkEnv } from './checkEnv';

async function bootstrap() {
  checkEnv();
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const globalPrefix = 'api/payments';
  app.setGlobalPrefix(globalPrefix);
  const port = 8006;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: <payments>:${port}/${globalPrefix} !!!`
  );
}

bootstrap();
