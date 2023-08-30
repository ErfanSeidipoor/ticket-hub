import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { JwtToken } from '@tickethub/utils';
import jwt from 'jsonwebtoken';
import { DBService } from '../app/db/db.service';
import { OrderStatusEnum } from '@tickethub/enums';

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

  async createOrder(attrs: {
    userId?: string;
    status?: OrderStatusEnum;
    price?: number;
  }) {
    const { price, userId, status } = attrs;

    const order = new this.DBservice.orderModel({
      userId: userId || faker.database.mongodbObjectId(),
      status: status || OrderStatusEnum.created,
      price: price || faker.number.int({ min: 100, max: 1000 }),
    });

    return {
      order: await order.save(),
    };
  }

  async createPayment(attrs: {
    token?: string;
    stripeId?: string;
    userId?: string;
  }) {
    const { token, stripeId, userId } = attrs;

    const payment = new this.DBservice.paymentModel({
      userId: userId || faker.database.mongodbObjectId(),
      stripeId: stripeId || faker.database.mongodbObjectId(),
      token: token || faker.string.alphanumeric(100),
    });

    return {
      payment: await payment.save(),
    };
  }
}
