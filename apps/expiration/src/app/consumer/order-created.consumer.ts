import { Injectable } from '@nestjs/common';
import { OrderCreatedEvent } from '@tickethub/event';
import { BullService } from '../bull/bull.service';

@Injectable()
export class OrderCreatedConsumerHandler {
  constructor(private readonly bullService: BullService) {}

  handler = async (value: OrderCreatedEvent['value']) => {
    const { id: orderId, expiresAt } = value;

    const delay = new Date(expiresAt).getTime() - new Date().getTime();

    await this.bullService.queue.add({ orderId }, { delay });
  };
}
