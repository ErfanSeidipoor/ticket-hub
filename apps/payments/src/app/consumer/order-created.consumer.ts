import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderCreatedEvent } from '@tickethub/event';
import { Order } from '@tickethub/payments/models';
import { Model } from 'mongoose';

@Injectable()
export class OrderCreatedConsumerHandler {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  handler = async (value: OrderCreatedEvent['value']) => {
    const {
      id,
      ticket: { price },
      userId,
      status,
    } = value;

    /* --------------------------------- change --------------------------------- */

    const order = new this.orderModel({ _id: id, status, price, userId });

    /* ---------------------------------- save ---------------------------------- */

    await order.save();
  };
}
