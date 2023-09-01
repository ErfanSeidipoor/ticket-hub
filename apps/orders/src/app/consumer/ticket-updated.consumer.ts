import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CustomError, TICKET_NOT_FOUND } from '@tickethub/error';
import { TicketUpdatedEvent } from '@tickethub/event';
import { Ticket } from '@tickethub/orders/models';
import { assignDefinedProps } from '@tickethub/utils';
import { Model } from 'mongoose';

@Injectable()
export class TicketUpdatedConsumerHandler {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  handler = async (value: TicketUpdatedEvent['value']) => {
    const { id, price, title } = value;

    /* ------------------------------- validation ------------------------------- */

    const ticket = await this.ticketModel.findById(id);

    if (!ticket) {
      throw new CustomError(TICKET_NOT_FOUND);
    }

    /* --------------------------------- change --------------------------------- */

    assignDefinedProps(ticket, { price, title });

    /* ---------------------------------- save ---------------------------------- */

    await ticket.save();
  };
}
