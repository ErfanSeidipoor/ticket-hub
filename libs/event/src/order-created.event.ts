import { OrderStatusEnum } from '@tickethub/enums';
import { BasicProducer } from './basic-producer';
import { TopicsEnum } from './topics.enum';

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
