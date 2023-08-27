import { BasicProducer } from './basic-producer';
import { TopicsEnum } from './topics.enum';

export interface TicketCreatedEvent {
  topic: TopicsEnum.ticket_created;
  value: {
    id: string;
    title: string;
    price: number;
    userId: string;
  };
}

export class TicketCreatedProducer extends BasicProducer<TicketCreatedEvent> {
  topic: TopicsEnum.ticket_created = TopicsEnum.ticket_created;
}
