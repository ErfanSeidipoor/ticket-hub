import { BasicCunsomer } from './basic-consumer';
import { BasicProducer } from './basic-producer';
import { TopicsEnum } from './topics.enum';

export interface OrderCreatedEvent {
  topic: TopicsEnum.order_created;
  value: {
    id: string;
    status: OrderStatusEnum;
    userId: string;
    expiresAt: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}

export class OrderCreatedCunsomer extends BasicCunsomer<OrderCreatedEvent> {
  topic: TopicsEnum.order_created = TopicsEnum.order_created;
}

export class OrderCreatedProducer extends BasicProducer<OrderCreatedEvent> {
  topic: TopicsEnum.order_created = TopicsEnum.order_created;
}
