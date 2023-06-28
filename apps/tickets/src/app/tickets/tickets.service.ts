import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateTicketRequestTickets,
  GetTicketsRequestTickets,
  UpdateTicketRequestTickets,
} from '@tickethub/dto';
import { CustomError, TICKET_NOT_FOUND } from '@tickethub/error';
import { Ticket, TicketDocument } from '@tickethub/tickets/models';
import { IPaginate, assignDefinedProps, paginate } from '@tickethub/utils';
import { FilterQuery, Model } from 'mongoose';
import { KafkaService } from '../kafka/kafka.service';
import { TicketCreatedProducer, TicketUpdatedProducer } from '@tickethub/event';
import { DBService } from '../db/db.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    private readonly kafkaService: KafkaService,
    private readonly dBServce: DBService
  ) {}

  async create(
    userId: string,
    { price, title }: CreateTicketRequestTickets
  ): Promise<TicketDocument> {
    /* --------------------------------- change --------------------------------- */

    const ticket = new this.ticketModel({ title, price, userId });

    /* ---------------------------------- save ---------------------------------- */

    await this.dBServce.transaction(async () => {
      await ticket.save();
      await new TicketCreatedProducer(this.kafkaService.producer).produce({
        id: ticket.id,
        userId,
        title,
        price,
      });
    });

    /* --------------------------------- return --------------------------------- */

    return ticket;
  }

  async getById(ticketId: string): Promise<TicketDocument> {
    /* ------------------------------- validation ------------------------------- */
    const ticket = await this.ticketModel.findOne({ _id: ticketId });

    if (!ticket) {
      throw new CustomError(TICKET_NOT_FOUND);
    }

    /* --------------------------------- return --------------------------------- */
    return ticket;
  }

  async get(query: GetTicketsRequestTickets): Promise<IPaginate<Ticket>> {
    const { limit, page, userId } = query;

    const queryBuilder: FilterQuery<Ticket> = {};

    if (userId) {
      queryBuilder.userId = userId;
    }

    /* --------------------------------- return --------------------------------- */
    return paginate(this.ticketModel, queryBuilder, page, limit);
  }

  async update(
    userId: string,
    ticketId: string,
    body: UpdateTicketRequestTickets
  ): Promise<TicketDocument> {
    const { price, title } = body;

    /* ------------------------------- validation ------------------------------- */

    const ticket = await this.ticketModel.findOne({ _id: ticketId, userId });

    if (!ticket) {
      throw new CustomError(TICKET_NOT_FOUND);
    }

    /* --------------------------------- change --------------------------------- */

    assignDefinedProps(ticket, { price, title });

    /* ---------------------------------- save ---------------------------------- */

    await this.dBServce.transaction(async () => {
      await ticket.save();
      await new TicketUpdatedProducer(this.kafkaService.producer).produce({
        id: ticket.id,
        userId,
        title,
        price,
      });
    });

    /* --------------------------------- return --------------------------------- */
    return ticket;
  }
}
