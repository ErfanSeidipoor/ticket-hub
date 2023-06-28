import { TicketCreatedCunsomerHandler } from './ticket-created.consumer';
import { TicketUpdatedCunsomerHandler } from './ticket-updated.consumer';

export const Consumers = [
  TicketCreatedCunsomerHandler,
  TicketUpdatedCunsomerHandler,
];
