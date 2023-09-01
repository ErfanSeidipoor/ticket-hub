import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TicketCreatedEvent } from '@tickethub/event';
import { Ticket } from '@tickethub/orders/models';
import { Model } from 'mongoose';

@Injectable()
export class TicketCreatedConsumerHandler {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  handler = async (value: TicketCreatedEvent['value']) => {
    const { id, price, title, userId } = value;

    /* --------------------------------- change --------------------------------- */

    const ticket = new this.ticketModel({ _id: id, title, price, userId });

    /* ---------------------------------- save ---------------------------------- */

    await ticket.save();
  };
}
