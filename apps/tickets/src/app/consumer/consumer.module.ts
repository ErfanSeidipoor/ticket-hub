import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from '@tickethub/tickets/models';
import { TicketsConsumerHandler, handlers } from '.';
import { KafkaModule } from '../kafka/kafka.module';
import { DBModule } from '../db/db.module';

@Module({
  imports: [
    KafkaModule,
    DBModule,
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
  ],
  providers: [...handlers, TicketsConsumerHandler],
  exports: [],
})
export class ConsumerModule {}
