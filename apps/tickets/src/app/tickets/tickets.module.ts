import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from '../kafka/kafka.module';
import { Ticket, TicketSchema } from '../../models';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketConsumer } from './create.consumer';

@Module({
  imports: [
    KafkaModule,
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
  ],
  providers: [TicketsService, CreateTicketConsumer],
  exports: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
