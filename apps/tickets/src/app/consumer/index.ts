import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  BasicCunsomer,
  OrderCancelledEvent,
  OrderCreatedEvent,
  TopicsEnum,
} from '@tickethub/event';

import { OrderCreatedCunsomerHandler } from './order-created.consumer';
import { OrderCancelledCunsomerHandler } from './order-cancelled.consumer';
import { KafkaService } from '../kafka/kafka.service';

class TicketsCunsomer extends BasicCunsomer<
  [OrderCreatedEvent, OrderCancelledEvent]
> {
  topics: [TopicsEnum.order_created, TopicsEnum.order_cancelled] = [
    TopicsEnum.order_created,
    TopicsEnum.order_cancelled,
  ];
}

export const handlers = [
  OrderCreatedCunsomerHandler,
  OrderCancelledCunsomerHandler,
];

@Injectable()
export class TicketsCunsomerHandler implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly orderCreatedCunsomerHandler: OrderCreatedCunsomerHandler,
    private readonly orderCancelledCunsomerHandler: OrderCancelledCunsomerHandler
  ) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new TicketsCunsomer(kafkaConsumer, {
      [TopicsEnum.order_created]: this.orderCreatedCunsomerHandler.handler,
      [TopicsEnum.order_cancelled]: this.orderCancelledCunsomerHandler.handler,
    }).consume();
  }
}
