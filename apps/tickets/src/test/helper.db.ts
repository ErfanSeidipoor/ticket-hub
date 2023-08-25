import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { TicketDocument } from '@tickethub/orders/models';
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

  async createTicket(attrs: {
    title?: string;
    price?: number;
    userId?: string;
    orderId?: string;
  }) {
    const { title, price, userId, orderId } = attrs;

    const ticket = new this.DBservice.ticketModel({
      title: title || faker.word.words(3),
      price: price || faker.number.float({ min: 100, max: 1000 }),
      userId: userId || faker.database.mongodbObjectId(),
      orderId,
    });

    return {
      ticket: await ticket.save(),
    };
  }

  async createMultipleTickets(
    count: number,
    attrs: {
      title?: string;
      price?: number;
      userId?: string;
    }
  ): Promise<TicketDocument[]> {
    const tickets: TicketDocument[] = [];

    for (let index = 0; index < count; index++) {
      const { ticket } = await this.createTicket(attrs);
      tickets.push(ticket);
    }

    return tickets;
  }
}
