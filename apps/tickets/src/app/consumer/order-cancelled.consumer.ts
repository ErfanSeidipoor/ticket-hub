import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CustomError, TICKET_NOT_FOUND } from '@tickethub/error';
import { OrderCancelledEvent } from '@tickethub/event';
import { Ticket } from '@tickethub/tickets/models';
import { assignDefinedProps } from '@tickethub/utils';
import { Model } from 'mongoose';

@Injectable()
export class OrderCancelledConsumerHandler {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  handler = async (value: OrderCancelledEvent['value']) => {
    const {
      ticket: { id: ticketId },
    } = value;

    /* ------------------------------- validation ------------------------------- */

    const ticket = await this.ticketModel.findById(ticketId);

    if (!ticket) {
      throw new CustomError(TICKET_NOT_FOUND);
    }

    /* --------------------------------- change --------------------------------- */

    assignDefinedProps(ticket, { orderId: null });

    /* ---------------------------------- save ---------------------------------- */

    await ticket.save();
  };
}
