import { Injectable } from '@nestjs/common';
import { OrderCreatedEvent } from '@tickethub/event';

@Injectable()
export class OrderCreatedCunsomerHandler {
  handler = async (value: OrderCreatedEvent['value']) => {
    const { id, expiresAt } = value;

    /* ------------------------------- validation ------------------------------- */

    /* --------------------------------- change --------------------------------- */

    /* ---------------------------------- save ---------------------------------- */
  };
}
