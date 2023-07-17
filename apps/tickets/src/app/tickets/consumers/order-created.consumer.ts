import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../kafka/kafka.service';
import { OrderCreatedCunsomer } from '@tickethub/event';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket } from '@tickethub/tickets/models';
import { Model } from 'mongoose';
import { CustomError, TICKET_NOT_FOUND } from '@tickethub/error';
import { assignDefinedProps } from '@tickethub/utils';

@Injectable()
export class OrderCreatedCunsomerHandler implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>
  ) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new OrderCreatedCunsomer(kafkaConsumer, async (message) => {
      const {
        id,
        ticket: { id: ticketId },
      } = message;

      /* ------------------------------- validation ------------------------------- */

      const ticket = await this.ticketModel.findById(ticketId);

      if (!ticket) {
        throw new CustomError(TICKET_NOT_FOUND);
      }

      /* --------------------------------- change --------------------------------- */

      assignDefinedProps(ticket, { orderId: id });

      /* ---------------------------------- save ---------------------------------- */

      await ticket.save();
    }).consume();
  }
}
