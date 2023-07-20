import { OrderStatusEnum } from '@tickethub/enums';
import { BasicCunsomer } from './basic-consumer';
import { BasicProducer } from './basic-producer';
import { TopicsEnum } from './topics.enum';
import { OrderCancelledEvent } from './order-cancelled.event';

export interface OrderCreatedEvent {
  topic: TopicsEnum.order_created;
  value: {
    id: string;
    status: OrderStatusEnum;
    userId: string;
    expiresAt: Date;
    ticket: {
      id: string;
      price: number;
    };
  };
}

export class OrderCreatedProducer extends BasicProducer<OrderCreatedEvent> {
  topic: TopicsEnum.order_created = TopicsEnum.order_created;
}
