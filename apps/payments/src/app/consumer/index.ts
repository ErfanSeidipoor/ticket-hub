import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  BasicConsumer,
  OrderCancelledEvent,
  OrderCreatedEvent,
  TopicsEnum,
} from '@tickethub/event';

import { OrderCreatedConsumerHandler } from './order-created.consumer';
import { OrderCancelledConsumerHandler } from './order-cancelled.consumer';
import { KafkaService } from '../kafka/kafka.service';

class PaymentsConsumer extends BasicConsumer<
  [OrderCreatedEvent, OrderCancelledEvent]
> {
  topics: [TopicsEnum.order_created, TopicsEnum.order_cancelled] = [
    TopicsEnum.order_created,
    TopicsEnum.order_cancelled,
  ];
}

export const handlers = [
  OrderCreatedConsumerHandler,
  OrderCancelledConsumerHandler,
];

@Injectable()
export class PaymentsConsumerHandler implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly orderCreatedConsumerHandler: OrderCreatedConsumerHandler,
    private readonly orderCancelledConsumerHandler: OrderCancelledConsumerHandler
  ) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new PaymentsConsumer(kafkaConsumer, {
      [TopicsEnum.order_created]: this.orderCreatedConsumerHandler.handler,
      [TopicsEnum.order_cancelled]: this.orderCancelledConsumerHandler.handler,
    }).consume();
  }
}
