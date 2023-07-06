import { ModelDefinition } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './ticket.model';
import { Order, OrderSchema } from './order.model';

export * from './ticket.model';
export * from './order.model';

export const models: ModelDefinition[] = [
  { name: Ticket.name, schema: TicketSchema },
  { name: Order.name, schema: OrderSchema },
];
