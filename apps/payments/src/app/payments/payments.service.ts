import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePaymentRequestPayments } from '@tickethub/dto';
import { OrderStatusEnum } from '@tickethub/enums';
import {
  CustomError,
  ORDER_IS_NO_LONGER_AVAILABLE,
  ORDER_NOT_FOUND,
  STRIPE_TOKEN_IS_USED_BEFORE,
  STRIPE_TOKEN_NOT_FOUND,
} from '@tickethub/error';
import { PaymentCreatedProducer } from '@tickethub/event';
import { Order, Payment, PaymentDocument } from '@tickethub/payments/models';
import { Model } from 'mongoose';
import { DBService } from '../db/db.service';
import { KafkaService } from '../kafka/kafka.service';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private readonly kafkaService: KafkaService,
    private readonly stripeService: StripeService,
    private readonly dBServce: DBService
  ) {}

  async createPayment(
    userId: string,
    { token, orderId }: CreatePaymentRequestPayments
  ): Promise<PaymentDocument> {
    /* ------------------------------- validation ------------------------------- */
    const order = await this.orderModel.findOne({ _id: orderId, userId });

    if (!order) {
      throw new CustomError(ORDER_NOT_FOUND);
    }

    if (order.status === OrderStatusEnum.cancelled) {
      throw new CustomError(ORDER_IS_NO_LONGER_AVAILABLE);
    }

    const oldPayment = await this.paymentModel.findOne({ token });

    if (oldPayment) {
      throw new CustomError(STRIPE_TOKEN_IS_USED_BEFORE);
    }

    /* --------------------------------- change --------------------------------- */

    order.status = OrderStatusEnum.complete;

    /* --------------------------- verify with stripe --------------------------- */

    let charge: Stripe.Response<Stripe.Charge>;

    try {
      charge = await this.stripeService.stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token,
      });
    } catch (error) {
      throw new CustomError(STRIPE_TOKEN_NOT_FOUND);
    }

    /* -------------------------------- creation -------------------------------- */

    const payment = new this.paymentModel({
      userId,
      stripeId: charge.id,
      orderId: order.id,
      token,
    });

    await this.dBServce.transaction(async () => {
      await payment.save();
      await new PaymentCreatedProducer(this.kafkaService.producer).produce({
        orderId: order.id,
        paymentId: payment.id,
      });
    });

    /* --------------------------------- return --------------------------------- */

    return payment;
  }
}
