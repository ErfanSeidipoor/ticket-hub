import { Injectable, OnModuleInit } from '@nestjs/common';
import { BasicCunsomer, OrderCreatedEvent, TopicsEnum } from '@tickethub/event';

import { KafkaService } from '../kafka/kafka.service';
import { OrderCreatedCunsomerHandler } from './order-created.consumer';

class ExpirationCunsomer extends BasicCunsomer<[OrderCreatedEvent]> {
  topics: [TopicsEnum.order_created] = [TopicsEnum.order_created];
}

export const handlers = [OrderCreatedCunsomerHandler];

@Injectable()
export class ExpirationCunsomerHandler implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly orderCreatedCunsomerHandler: OrderCreatedCunsomerHandler
  ) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new ExpirationCunsomer(kafkaConsumer, {
      [TopicsEnum.order_created]: this.orderCreatedCunsomerHandler.handler,
    }).consume();
  }
}
