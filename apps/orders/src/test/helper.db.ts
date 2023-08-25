import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { OrderStatusEnum } from '@tickethub/enums';
import { OrderDocument, TicketDocument } from '@tickethub/orders/models';
import { JwtToken } from '@tickethub/utils';
import jwt from 'jsonwebtoken';
import { DBService } from '../app/db/db.service';

export class HelperDB {
  DBservice: DBService;

  constructor(public app: INestApplication) {
    this.DBservice = app.get<DBService>(DBService);
  }

  async closeConnection() {
    this.DBservice.connection.close();
  }

  async dropAllCollections() {
    const {
      connection: { collections },
    } = this.DBservice;

    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }

  async createUser() {
    const userId = faker.database.mongodbObjectId();
    const email = faker.internet.email();

    const jwtToken: JwtToken = {
      id: userId,
      email,
    };

    const userJwt = jwt.sign(jwtToken, process.env['JWT_KEY']);

    return {
      userJwt,
      userId,
    };
  }

  async createTicket(attrs: { title?: string; price?: number }) {
    const { title, price } = attrs;

    const ticket = new this.DBservice.ticketModel({
      title: title || faker.word.words(3),
      price: price || faker.number.float({ min: 100, max: 1000 }),
    });

    return {
      ticket: await ticket.save(),
    };
  }

  async createOrder(attrs: {
    ticket: TicketDocument;
    userId?: string;
    status?: OrderStatusEnum;
  }) {
    const { ticket, userId, status } = attrs;

    const order = new this.DBservice.orderModel({
      userId: userId || faker.database.mongodbObjectId(),
      ticket,
      status: status || OrderStatusEnum.created,
    });

    return {
      order: await order.save(),
    };
  }

  async createMultipleOrders(
    count: number,
    attrs: {
      ticket?: TicketDocument;
      userId?: string;
      status?: OrderStatusEnum;
    }
  ): Promise<OrderDocument[]> {
    const orders: OrderDocument[] = [];

    for (let index = 0; index < count; index++) {
      const ticket = attrs.ticket || (await this.createTicket({})).ticket;

      const { order } = await this.createOrder({
        ...attrs,
        ticket,
      });

      orders.push(order);
    }

    return orders;
  }
}
