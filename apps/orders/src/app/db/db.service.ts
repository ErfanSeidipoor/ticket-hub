import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Order } from '@tickethub/orders/models';
import { Connection, Model } from 'mongoose';

@Injectable()
export class DBService {
  constructor(
    @InjectConnection() public readonly connection: Connection,
    @InjectModel(Order.name) public ticketModel: Model<Order>
  ) {}

  async transaction(fn: () => Promise<void>) {
    const session = await this.ticketModel.db.startSession();

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
