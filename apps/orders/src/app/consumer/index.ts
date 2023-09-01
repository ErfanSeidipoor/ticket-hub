import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  BasicConsumer,
  TicketCreatedEvent,
  TicketUpdatedEvent,
  OrderExpirationEvent,
  PaymentCreatedEvent,
  TopicsEnum,
} from '@tickethub/event';

import { TicketCreatedConsumerHandler } from './ticket-created.consumer';
import { TicketUpdatedConsumerHandler } from './ticket-updated.consumer';
import { OrderExpirationConsumerHandler } from './order-expiration.consumer';
import { PaymentCreatedConsumerHandler } from './payment-created.consumer';
import { KafkaService } from '../kafka/kafka.service';

class OrdersConsumer extends BasicConsumer<
  [
    TicketCreatedEvent,
    TicketUpdatedEvent,
    OrderExpirationEvent,
    PaymentCreatedEvent
  ]
> {
  topics: [
    TopicsEnum.ticket_created,
    TopicsEnum.ticket_updated,
    TopicsEnum.order_expiration,
    TopicsEnum.payment_created
  ] = [
    TopicsEnum.ticket_created,
    TopicsEnum.ticket_updated,
    TopicsEnum.order_expiration,
    TopicsEnum.payment_created,
  ];
}

export const handlers = [
  TicketCreatedConsumerHandler,
  TicketUpdatedConsumerHandler,
  OrderExpirationConsumerHandler,
  PaymentCreatedConsumerHandler,
];

@Injectable()
export class OrdersConsumerHandler implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly ticketCreatedConsumerHandler: TicketCreatedConsumerHandler,
    private readonly ticketUpdatedConsumerHandler: TicketUpdatedConsumerHandler,
    private readonly orderExpirationConsumerHandler: OrderExpirationConsumerHandler,
    private readonly paymentCreatedConsumerHandler: PaymentCreatedConsumerHandler
  ) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new OrdersConsumer(kafkaConsumer, {
      [TopicsEnum.ticket_created]: this.ticketCreatedConsumerHandler.handler,
      [TopicsEnum.ticket_updated]: this.ticketUpdatedConsumerHandler.handler,
      [TopicsEnum.order_expiration]:
        this.orderExpirationConsumerHandler.handler,
      [TopicsEnum.payment_created]: this.paymentCreatedConsumerHandler.handler,
    }).consume();
  }
}
