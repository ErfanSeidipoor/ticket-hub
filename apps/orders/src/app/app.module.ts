import { MiddlewareConsumer, Module } from '@nestjs/common';
import { OrdersModule } from './tickets/orders.module';
import { KafkaModule } from './kafka/kafka.module';
import { CurrentUserMiddleware } from '@tickethub/middleware';
import { DBModule } from './db/db.module';

@Module({
  imports: [DBModule, OrdersModule, KafkaModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
