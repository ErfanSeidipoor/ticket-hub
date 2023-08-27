import { BasicProducer } from './basic-producer';
import { TopicsEnum } from './topics.enum';

export interface TicketUpdatedEvent {
  topic: TopicsEnum.ticket_updated;
  value: {
    id: string;
    title: string;
    price: number;
  };
}

export class TicketUpdatedProducer extends BasicProducer<TicketUpdatedEvent> {
  topic: TopicsEnum.ticket_updated = TopicsEnum.ticket_updated;
}
