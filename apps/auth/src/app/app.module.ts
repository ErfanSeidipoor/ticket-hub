import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CurrentUserMiddleware } from '../middlewares';
import { AuthModule } from './auth/auth.module';
import { DBModule } from './db/db.module';

@Module({
  imports: [DBModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
