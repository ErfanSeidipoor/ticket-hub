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

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    private readonly kafkaService: KafkaService
  ) {}

  async create(
    userId: string,
    { price, title }: CreateTicketRequestTickets
  ): Promise<TicketDocument> {
    const ticket = new this.ticketModel({ title, price, userId });

    const res = await this.kafkaService.produce({
      topic: 'tickets-create-ticket',
      messages: [
        { key: userId, value: JSON.stringify({ title, price, userId }) },
      ],
    });

    return ticket.save();
  }

  async getById(ticketId: string): Promise<TicketDocument> {
    const ticket = await this.ticketModel.findOne({ _id: ticketId });

    if (!ticket) {
      throw new CustomError(TICKET_NOT_FOUND);
    }

    return ticket;
  }

  async get(query: GetTicketsRequestTickets): Promise<IPaginate<Ticket>> {
    const { limit, page, userId } = query;

    const queryBuilder: FilterQuery<Ticket> = {};

    if (userId) {
      queryBuilder.userId = userId;
    }

    return paginate(this.ticketModel, queryBuilder, page, limit);
  }

  async update(
    userId: string,
    ticketId: string,
    body: UpdateTicketRequestTickets
  ): Promise<TicketDocument> {
    const ticket = await this.ticketModel.findOne({ _id: ticketId, userId });

    if (!ticket) {
      throw new CustomError(TICKET_NOT_FOUND);
    }

    assignDefinedProps(ticket, body);

    return ticket.save();
  }
}
