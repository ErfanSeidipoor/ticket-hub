import { MiddlewareConsumer, Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { KafkaModule } from './kafka/kafka.module';
import { CurrentUserMiddleware } from '@tickethub/middleware';
import { DBModule } from './db/db.module';
import { ConsumerModule } from './consumer/consumer.module';

@Module({
  imports: [DBModule, OrdersModule, KafkaModule, ConsumerModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
