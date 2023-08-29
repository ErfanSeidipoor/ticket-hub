import { ModelDefinition } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.model';
import { Payment, PaymentSchema } from './payment.model';

export * from './order.model';
export * from './payment.model';

export const models: ModelDefinition[] = [
  { name: Order.name, schema: OrderSchema },
  { name: Payment.name, schema: PaymentSchema },
];
