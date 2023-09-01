import { Module } from '@nestjs/common';
import { ExpirationConsumerHandler, handlers } from '.';
import { KafkaModule } from '../kafka/kafka.module';
import { BullModule } from '../bull/bull.module';

@Module({
  imports: [KafkaModule, BullModule],
  providers: [...handlers, ExpirationConsumerHandler],
  exports: [],
})
export class ConsumerModule {}
