import { BasicProducer } from './basic-producer';
import { TopicsEnum } from './topics.enum';

export interface PaymentCreatedEvent {
  topic: TopicsEnum.payment_created;
  value: {
    orderId: string;
    paymentId: string;
  };
}

export class PaymentCreatedProducer extends BasicProducer<PaymentCreatedEvent> {
  topic: TopicsEnum.payment_created = TopicsEnum.payment_created;
}
