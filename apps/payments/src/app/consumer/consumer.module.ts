import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { models } from '@tickethub/payments/models';
import { PaymentsCunsomerHandler, handlers } from '.';
import { KafkaModule } from '../kafka/kafka.module';
import { DBModule } from '../db/db.module';

@Module({
  imports: [KafkaModule, DBModule, MongooseModule.forFeature(models)],
  providers: [...handlers, PaymentsCunsomerHandler],
  exports: [],
})
export class ConsumerModule {}
