import { Module } from '@nestjs/common';
import { TicketsCunsomerHandler, handlers } from '.';
import { KafkaModule } from '../kafka/kafka.module';
import { BullModule } from '../bull/bull.module';

@Module({
  imports: [KafkaModule, BullModule],
  providers: [...handlers, TicketsCunsomerHandler],
  exports: [],
})
export class ConsumerModule {}
