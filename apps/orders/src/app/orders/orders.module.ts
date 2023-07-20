import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from '../kafka/kafka.module';
import { models } from '../../models';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
// import { consumers } from './consomers';
import { DBModule } from '../db/db.module';

@Module({
  imports: [KafkaModule, DBModule, MongooseModule.forFeature(models)],
  providers: [OrdersService],
  exports: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
