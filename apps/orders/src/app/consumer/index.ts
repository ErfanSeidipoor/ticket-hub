import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  BasicCunsomer,
  TicketCreatedEvent,
  TicketUpdatedEvent,
  OrderExpirationEvent,
  TopicsEnum,
} from '@tickethub/event';

import { TicketCreatedCunsomerHandler } from './ticket-created.consumer';
import { TicketUpdatedCunsomerHandler } from './ticket-updated.consumer';
import { OrderExpirationCunsomerHandler } from './order-expiration.consumer';
import { KafkaService } from '../kafka/kafka.service';

class OrdersCunsomer extends BasicCunsomer<
  [TicketCreatedEvent, TicketUpdatedEvent, OrderExpirationEvent]
> {
  topics: [
    TopicsEnum.ticket_created,
    TopicsEnum.ticket_updated,
    TopicsEnum.order_expiration
  ] = [
    TopicsEnum.ticket_created,
    TopicsEnum.ticket_updated,
    TopicsEnum.order_expiration,
  ];
}

export const handlers = [
  TicketCreatedCunsomerHandler,
  TicketUpdatedCunsomerHandler,
  OrderExpirationCunsomerHandler,
];

@Injectable()
export class OrdersCunsomerHandler implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly ticketCreatedCunsomerHandler: TicketCreatedCunsomerHandler,
    private readonly ticketUpdatedCunsomerHandler: TicketUpdatedCunsomerHandler,
    private readonly orderExpirationCunsomerHandler: OrderExpirationCunsomerHandler
  ) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new OrdersCunsomer(kafkaConsumer, {
      [TopicsEnum.ticket_created]: this.ticketCreatedCunsomerHandler.handler,
      [TopicsEnum.ticket_updated]: this.ticketUpdatedCunsomerHandler.handler,
      [TopicsEnum.order_expiration]:
        this.orderExpirationCunsomerHandler.handler,
    }).consume();
  }
}
