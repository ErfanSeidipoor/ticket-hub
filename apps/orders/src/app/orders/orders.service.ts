import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateOrderRequestOrders,
  GetOrdersRequestOrders,
} from '@tickethub/dto';
import { OrderStatusEnum } from '@tickethub/enums';
import {
  CustomError,
  ORDER_NOT_FOUND,
  TICKET_IS_ALREADY_RESERVED_FOUND,
  TICKET_NOT_FOUND,
} from '@tickethub/error';
import { OrderCancelledProducer, OrderCreatedProducer } from '@tickethub/event';
import {
  Order,
  OrderDocument,
  Ticket,
  TicketDocument,
} from '@tickethub/orders/models';
import { IPaginate, paginate } from '@tickethub/utils';
import { FilterQuery, Model } from 'mongoose';
import { DBService } from '../db/db.service';
import { KafkaService } from '../kafka/kafka.service';

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly kafkaService: KafkaService,
    private readonly dBServce: DBService
  ) {}

  async create(
    userId: string,
    { ticketId }: CreateOrderRequestOrders
  ): Promise<OrderDocument> {
    /* ------------------------------- validation ------------------------------- */
    const ticket = await this.ticketModel.findOne({ _id: ticketId });

    if (!ticket) {
      throw new CustomError(TICKET_NOT_FOUND);
    }

    const resesrvedOrder = await this.orderModel.findOne({
      ticket,
      status: {
        $in: [
          OrderStatusEnum.created,
          OrderStatusEnum.awaiting_payment,
          OrderStatusEnum.complete,
        ],
      },
    });

    if (resesrvedOrder) {
      throw new CustomError(TICKET_IS_ALREADY_RESERVED_FOUND);
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    /* -------------------------------- creation -------------------------------- */

    const order = new this.orderModel({
      userId,
      status: OrderStatusEnum.created,
      expiresAt: expiration,
      ticket,
    });

    /* ---------------------------------- save ---------------------------------- */

    await this.dBServce.transaction(async () => {
      await order.save();
      await new OrderCreatedProducer(this.kafkaService.producer).produce({
        id: order.id,
        expiresAt: expiration,
        status: OrderStatusEnum.created,
        userId,
        ticket: {
          id: ticketId,
          price: ticket.price,
        },
      });
    });

    /* --------------------------------- return --------------------------------- */

    return order;
  }

  async getById(userId: string, orderId: string): Promise<OrderDocument> {
    /* ------------------------------- validation ------------------------------- */
    const order = await this.orderModel.findOne({ _id: orderId, userId });

    if (!order) {
      throw new CustomError(ORDER_NOT_FOUND);
    }

    /* --------------------------------- return --------------------------------- */
    return order;
  }

  async get(
    userId: string,
    query: GetOrdersRequestOrders
  ): Promise<IPaginate<Order>> {
    const { limit, page } = query;

    const queryBuilder: FilterQuery<Order> = { userId };

    /* --------------------------------- return --------------------------------- */
    return paginate(this.orderModel, queryBuilder, page, limit);
  }

  async cancel(userId: string, orderId: string): Promise<OrderDocument> {
    /* ------------------------------- validation ------------------------------- */

    const order = await this.orderModel
      .findOne({ _id: orderId, userId })
      .populate('ticket');

    if (!order) {
      throw new CustomError(ORDER_NOT_FOUND);
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

    /* --------------------------------- return --------------------------------- */
    return order;
  }
}
