import { Module } from '@nestjs/common';
import { ExpirationCunsomerHandler, handlers } from '.';
import { KafkaModule } from '../kafka/kafka.module';
import { BullModule } from '../bull/bull.module';

@Module({
  imports: [KafkaModule, BullModule],
  providers: [...handlers, ExpirationCunsomerHandler],
  exports: [],
})
export class ConsumerModule {}
