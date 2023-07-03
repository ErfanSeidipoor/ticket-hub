import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from '../kafka/kafka.module';
import { Ticket, TicketSchema } from '../../models';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Consumers } from './cusnomers';
import { DBModule } from '../db/db.module';

@Module({
  imports: [
    KafkaModule,
    DBModule,
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
  ],
  providers: [TicketsService, ...Consumers],
  exports: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
