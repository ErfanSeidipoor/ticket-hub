import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket } from '@tickethub/tickets/models';
import { Model } from 'mongoose';
import { CustomError, TICKET_NOT_FOUND } from '@tickethub/error';
import { assignDefinedProps } from '@tickethub/utils';
import { OrderCreatedEvent } from '@tickethub/event';

@Injectable()
export class OrderCreatedConsumerHandler {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  handler = async (value: OrderCreatedEvent['value']) => {
    const {
      id,
      ticket: { id: ticketId },
    } = value;

    /* ------------------------------- validation ------------------------------- */

    const ticket = await this.ticketModel.findById(ticketId);

    if (!ticket) {
      throw new CustomError(TICKET_NOT_FOUND);
    }

    /* --------------------------------- change --------------------------------- */

    assignDefinedProps(ticket, { orderId: id });

    /* ---------------------------------- save ---------------------------------- */

    await ticket.save();
  };
}
