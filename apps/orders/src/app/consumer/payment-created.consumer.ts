import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderStatusEnum } from '@tickethub/enums';
import { CustomError, ORDER_NOT_FOUND } from '@tickethub/error';
import { PaymentCreatedEvent } from '@tickethub/event';
import { Order } from '@tickethub/orders/models';
import { Model } from 'mongoose';

@Injectable()
export class PaymentCreatedCunsomerHandler {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  handler = async (value: PaymentCreatedEvent['value']) => {
    const { orderId } = value;
    /* ------------------------------- validation ------------------------------- */

    const order = await this.orderModel.findById(orderId).populate('ticket');

    if (!order) {
      throw new CustomError(ORDER_NOT_FOUND);
    }

    /* --------------------------------- change --------------------------------- */

    order.status = OrderStatusEnum.complete;

    /* ---------------------------------- save ---------------------------------- */

    await order.save();
  };
}
