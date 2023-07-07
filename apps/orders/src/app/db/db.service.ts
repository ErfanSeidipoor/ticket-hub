import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Order, Ticket } from '@tickethub/orders/models';
import { Connection, Model } from 'mongoose';

@Injectable()
export class DBService {
  constructor(
    @InjectConnection() public readonly connection: Connection,
    @InjectModel(Ticket.name) public ticketModel: Model<Ticket>,
    @InjectModel(Order.name) public orderModel: Model<Order>
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
