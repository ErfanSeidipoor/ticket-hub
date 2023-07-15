import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../kafka/kafka.service';
import { TicketUpdatedCunsomer } from '@tickethub/event';
import { Ticket } from '@tickethub/orders/models';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CustomError, TICKET_NOT_FOUND } from '@tickethub/error';
import { assignDefinedProps } from '@tickethub/utils';

@Injectable()
export class TicketUpdatedCunsomerHandler implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>
  ) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new TicketUpdatedCunsomer(kafkaConsumer, async (message) => {
      const { id, price, title } = message;

      /* ------------------------------- validation ------------------------------- */

      const ticket = await this.ticketModel.findById(id);

      if (!ticket) {
        throw new CustomError(TICKET_NOT_FOUND);
      }

      /* --------------------------------- change --------------------------------- */

      assignDefinedProps(ticket, { price, title });

      /* ---------------------------------- save ---------------------------------- */

      await ticket.save();
    }).consume();
  }
}
