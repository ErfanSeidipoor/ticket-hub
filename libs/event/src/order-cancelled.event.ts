import { BasicProducer } from './basic-producer';
import { TopicsEnum } from './topics.enum';

export interface OrderCancelledEvent {
  topic: TopicsEnum.order_cancelled;
  value: {
    id: string;
    ticket: {
      id: string;
    };
  };
}

export class OrderCancelledProducer extends BasicProducer<OrderCancelledEvent> {
  topic: TopicsEnum.order_cancelled = TopicsEnum.order_cancelled;
}
