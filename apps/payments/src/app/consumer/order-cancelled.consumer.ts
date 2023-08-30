import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderStatusEnum } from '@tickethub/enums';
import { CustomError, ORDER_NOT_FOUND } from '@tickethub/error';
import { OrderCancelledEvent } from '@tickethub/event';
import { Order } from '@tickethub/payments/models';
import { assignDefinedProps } from '@tickethub/utils';
import { Model } from 'mongoose';

@Injectable()
export class OrderCancelledCunsomerHandler {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  handler = async (value: OrderCancelledEvent['value']) => {
    const { id: orderId } = value;

    /* ------------------------------- validation ------------------------------- */

    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new CustomError(ORDER_NOT_FOUND);
    }

    /* --------------------------------- change --------------------------------- */

    order.status = OrderStatusEnum.cancelled;

    /* ---------------------------------- save ---------------------------------- */

    await order.save();
  };
}
