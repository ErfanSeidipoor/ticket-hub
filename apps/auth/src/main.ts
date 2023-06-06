import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupApp } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const globalPrefix = 'api/auth';
  app.setGlobalPrefix(globalPrefix);
  const port = 8001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: <auth>:${port}/${globalPrefix} !!!`
  );
}

bootstrap();
