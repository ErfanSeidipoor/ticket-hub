import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DBService } from './db.service';
import { Ticket, TicketSchema } from '@tickethub/tickets/models';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL),
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
  ],
  providers: [DBService],
  exports: [DBService],
})
export class DBModule {}
