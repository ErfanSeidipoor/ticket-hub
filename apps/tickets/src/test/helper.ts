import { INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { DBService } from '../app/db/db.service';
import { JwtToken, Password } from '@tickethub/utils';

export class Helper {
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

  async createTicket(attrs: {
    title?: string;
    price?: number;
    userId?: string;
  }) {
    const { title, price, userId } = attrs;

    const ticket = new this.DBservice.ticketModel({
      title: title || faker.word.words(3),
      price: price || faker.number.float({ min: 100, max: 1000 }),
      userId: userId || faker.database.mongodbObjectId(),
    });

    return {
      ticket: await ticket.save(),
    };
  }
}
