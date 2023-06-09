import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TicketsModule } from './tickets/tickets.module';
import { CurrentUserMiddleware } from '@tickethub/middleware';
import { DBModule } from './db/db.module';

@Module({
  imports: [DBModule, TicketsModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
