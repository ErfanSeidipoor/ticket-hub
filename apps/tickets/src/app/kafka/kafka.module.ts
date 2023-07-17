import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Module({
  providers: [KafkaService],
  exports: [KafkaService],
  controllers: [],
})
export class KafkaModule {}
