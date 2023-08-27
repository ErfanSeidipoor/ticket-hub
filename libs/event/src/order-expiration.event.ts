import { BasicProducer } from './basic-producer';
import { TopicsEnum } from './topics.enum';

export interface OrderExpirationEvent {
  topic: TopicsEnum.order_expiration;
  value: {
    id: string;
  };
}

export class OrderExpirationProducer extends BasicProducer<OrderExpirationEvent> {
  topic: TopicsEnum.order_expiration = TopicsEnum.order_expiration;
}
