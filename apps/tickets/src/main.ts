import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupApp } from './setup-app';
import { checkEnv } from './checkEnv';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  checkEnv();
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const globalPrefix = 'api/tickets';
  app.setGlobalPrefix(globalPrefix);
  const port = 8003;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: <tickets>:${port}/${globalPrefix} !!!`
  );
}

bootstrap();
