import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderExpirationEvent } from '@tickethub/event';
import { OrderCancelledProducer } from '@tickethub/event';
import { Order } from '@tickethub/orders/models';
import { Model } from 'mongoose';
import { DBService } from '../db/db.service';
import { OrderStatusEnum } from '@tickethub/enums';
import { CustomError, ORDER_NOT_FOUND } from '@tickethub/error';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class OrderExpirationConsumerHandler {
  constructor(
    private readonly dBServce: DBService,
    private readonly kafkaService: KafkaService,
    @InjectModel(Order.name) private orderModel: Model<Order>
  ) {}

  handler = async (value: OrderExpirationEvent['value']) => {
    const { id } = value;
    /* ------------------------------- validation ------------------------------- */

    const order = await this.orderModel.findOne({ _id: id }).populate('ticket');

    if (!order) {
      throw new CustomError(ORDER_NOT_FOUND);
    }

    if (order.status === OrderStatusEnum.complete) {
      return;
    }

    /* --------------------------------- change --------------------------------- */

    order.status = OrderStatusEnum.cancelled;

    /* ---------------------------------- save ---------------------------------- */

    await this.dBServce.transaction(async () => {
      await order.save();
      await new OrderCancelledProducer(this.kafkaService.producer).produce({
        id: order.id,
        ticket: {
          id: order.ticket.id,
        },
      });
    });
  };
}
