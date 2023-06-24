import { INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { TicketDocument } from '@tickethub/tickets/models';
import jwt from 'jsonwebtoken';
import { DBService } from '../app/db/db.service';
import { KafkaService } from '../app/kafka/kafka.service';
import { JwtToken } from '@tickethub/utils';
import { KafkaMessage } from 'kafkajs';

export class Helper {
  DBservice: DBService;
  kafkaService: KafkaService;
  kafkaMessages: { topic: string; partition: number; message: KafkaMessage }[];

  constructor(public app: INestApplication) {
    this.DBservice = app.get<DBService>(DBService);
    this.kafkaService = app.get<KafkaService>(KafkaService);
    this.kafkaMessages = [];
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

  async createKafkaConsumer() {
    await this.kafkaService.consume(
      { topics: this.kafkaService.requiredTopics },
      {
        eachMessage: async ({ topic, partition, message }) => {
          console.log({
            message: message.value.toString(),
            partition: partition.toString(),
            topic: topic.toString(),
          });
          this.kafkaMessages.push({ topic, partition, message });
        },
      },
      'grounp-test'
    );
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
