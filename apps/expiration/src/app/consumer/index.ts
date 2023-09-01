import { Injectable, OnModuleInit } from '@nestjs/common';
import { BasicConsumer, OrderCreatedEvent, TopicsEnum } from '@tickethub/event';

import { KafkaService } from '../kafka/kafka.service';
import { OrderCreatedConsumerHandler } from './order-created.consumer';

class ExpirationConsumer extends BasicConsumer<[OrderCreatedEvent]> {
  topics: [TopicsEnum.order_created] = [TopicsEnum.order_created];
}

export const handlers = [OrderCreatedConsumerHandler];

@Injectable()
export class ExpirationConsumerHandler implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly orderCreatedConsumerHandler: OrderCreatedConsumerHandler
  ) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new ExpirationConsumer(kafkaConsumer, {
      [TopicsEnum.order_created]: this.orderCreatedConsumerHandler.handler,
    }).consume();
  }
}
