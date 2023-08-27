import { Module } from '@nestjs/common';
import { ConsumerModule } from './consumer/consumer.module';
import { KafkaModule } from './kafka/kafka.module';
import { BullModule } from './bull/bull.module';

@Module({
  imports: [BullModule, KafkaModule, ConsumerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
