import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { models } from '@tickethub/payments/models';
import { PaymentsConsumerHandler, handlers } from '.';
import { KafkaModule } from '../kafka/kafka.module';
import { DBModule } from '../db/db.module';

@Module({
  imports: [KafkaModule, DBModule, MongooseModule.forFeature(models)],
  providers: [...handlers, PaymentsConsumerHandler],
  exports: [],
})
export class ConsumerModule {}
