export enum OrderStatusEnum {
  // When the order has been created, but the
  // ticket it is trying to order has not been reserved
  created = 'created',

  // The ticket the order is trying to reserve has already
  // been reserved, or when the user has cancelled the order.
  // The order expires before payment
  cancelled = 'cancelled',

  // The order has successfully reserved the ticket
  awaiting_payment = 'awaiting-payment',

  // The order has reserved the ticket and the user has
  // provided payment successfully
  complete = 'complete',
}
