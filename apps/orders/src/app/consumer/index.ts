import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  BasicCunsomer,
  TicketCreatedEvent,
  TicketUpdatedEvent,
  TopicsEnum,
} from '@tickethub/event';

import { TicketCreatedCunsomerHandler } from './ticket-created.consumer';
import { TicketUpdatedCunsomerHandler } from './ticket-updated.consumer';
import { KafkaService } from '../kafka/kafka.service';

class OrdersCunsomer extends BasicCunsomer<
  [TicketCreatedEvent, TicketUpdatedEvent]
> {
  topics: [TopicsEnum.ticket_created, TopicsEnum.ticket_updated] = [
    TopicsEnum.ticket_created,
    TopicsEnum.ticket_updated,
  ];
}

export const handlers = [
  TicketCreatedCunsomerHandler,
  TicketUpdatedCunsomerHandler,
];

@Injectable()
export class OrdersCunsomerHandler implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly ticketCreatedCunsomerHandler: TicketCreatedCunsomerHandler,
    private readonly ticketUpdatedCunsomerHandler: TicketUpdatedCunsomerHandler
  ) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new OrdersCunsomer(kafkaConsumer, {
      [TopicsEnum.ticket_created]: this.ticketCreatedCunsomerHandler.handler,
      [TopicsEnum.ticket_updated]: this.ticketUpdatedCunsomerHandler.handler,
    }).consume();
  }
}
