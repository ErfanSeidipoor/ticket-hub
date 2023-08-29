import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Order, Payment } from '@tickethub/payments/models';
import { Connection, Model } from 'mongoose';

@Injectable()
export class DBService {
  constructor(
    @InjectConnection() public readonly connection: Connection,
    @InjectModel(Order.name) public orderModel: Model<Order>,
    @InjectModel(Payment.name) public paymentModel: Model<Payment>
  ) {}

  async transaction(fn: () => Promise<void>) {
    const session = await this.orderModel.db.startSession();

    try {
      session.startTransaction();
      await fn();
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
