import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { KafkaModule } from './kafka/kafka.module';
import { CurrentUserMiddleware } from '@tickethub/middleware';
import { DBModule } from './db/db.module';
import { StripeModule } from './stripe/stripe.module';
import { ConsumerModule } from './consumer/consumer.module';

@Module({
  imports: [
    DBModule,
    PaymentsModule,
    KafkaModule,
    ConsumerModule,
    StripeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
