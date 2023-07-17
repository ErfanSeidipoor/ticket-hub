import { OrderCreatedCunsomerHandler } from './order-created.consumer';
import { OrderCancelledCunsomerHandler } from './order-updated.consumer';

export const consumers = [
  OrderCreatedCunsomerHandler,
  // OrderCancelledCunsomerHandler,
];
