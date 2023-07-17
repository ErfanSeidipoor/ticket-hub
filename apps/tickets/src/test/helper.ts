import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import {
  TicketCreatedCunsomer,
  TicketCreatedEvent,
  TicketUpdatedCunsomer,
  TicketUpdatedEvent,
} from '@tickethub/event';
import { TicketDocument } from '@tickethub/orders/models';
import { JwtToken } from '@tickethub/utils';
import jwt from 'jsonwebtoken';
import { DBService } from '../app/db/db.service';
import { KafkaService } from '../app/kafka/kafka.service';

export class Helper {
  DBservice: DBService;
  kafkaService: KafkaService;
  kafkaMessages: (TicketCreatedEvent | TicketUpdatedEvent)[] = [];
  groupId = 'group-test';

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

  async cleareMessages() {
    this.kafkaMessages = [];

    for (const topic of this.kafkaService.requiredTopics) {
      const topicOffsets = await this.kafkaService.admin.fetchTopicOffsets(
        topic
      );

      for (const topicOffset of topicOffsets) {
        const { partition, low, high } = topicOffset;
        for (let offset = Number(low); offset <= Number(high); offset++) {
          await this.kafkaService.admin.deleteTopicRecords({
            topic,
            partitions: [
              {
                partition,
                offset: String(offset),
              },
            ],
          });
        }
      }
    }
  }

  async createTicketUpdatedCunsomer() {
    await new TicketUpdatedCunsomer(
      await this.kafkaService.createConsumer(this.groupId),
      async (value, topic) => {
        this.kafkaMessages.push({
          topic,
          value,
        });
      }
    ).consume();
  }

  async createTicketCreatedCunsomer() {
    await new TicketCreatedCunsomer(
      await this.kafkaService.createConsumer(this.groupId),
      async (value, topic) => {
        this.kafkaMessages.push({
          topic,
          value,
        });
      }
    ).consume();
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
