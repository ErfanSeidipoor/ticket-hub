import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from '../kafka/kafka.module';
import { StripeModule } from '../stripe/stripe.module';
import { models } from '../../models';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { DBModule } from '../db/db.module';

@Module({
  imports: [
    StripeModule,
    KafkaModule,
    DBModule,
    MongooseModule.forFeature(models),
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
