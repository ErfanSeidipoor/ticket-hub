import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { models } from '@tickethub/orders/models';
import { OrdersConsumerHandler, handlers } from '.';
import { KafkaModule } from '../kafka/kafka.module';
import { DBModule } from '../db/db.module';

@Module({
  imports: [KafkaModule, DBModule, MongooseModule.forFeature(models)],
  providers: [...handlers, OrdersConsumerHandler],
  exports: [],
})
export class ConsumerModule {}
