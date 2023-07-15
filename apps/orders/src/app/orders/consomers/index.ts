import { TicketCreatedCunsomerHandler } from './ticket-created.consumer';
import { TicketUpdatedCunsomerHandler } from './ticket-updated.consumer';

export const consumers = [
  TicketCreatedCunsomerHandler,
  TicketUpdatedCunsomerHandler,
];
