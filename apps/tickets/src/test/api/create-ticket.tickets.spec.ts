import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { AppModule } from '@tickethub/tickets/app/app.module';
import { setupApp } from '@tickethub/tickets/setup-app';
import { CreateTicketRequestTickets } from '@tickethub/dto';
import { sleep } from '@tickethub/utils';
import { TicketCreatedEvent, TopicsEnum } from '@tickethub/event';
import { HelperDB } from '../helper.db';
import { HelperKafka } from '../helper.kafka';

const url = '/';
jest.setTimeout(30000);
describe('tickets(POST) api/tickets', () => {
  let app: INestApplication;
  let helperDB: HelperDB;
  let helperKafka: HelperKafka;
  let requestBody: CreateTicketRequestTickets;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    helperDB = new HelperDB(app);
    helperKafka = new HelperKafka(app);

    await helperKafka.createTicketCreatedConsumer();
  });

  beforeEach(async () => {
    await helperDB.dropAllCollections();
    await helperKafka.cleareMessages();
  });

  afterAll(async () => {
    await helperDB.closeConnection();
    await helperKafka.cleareMessages();
  });

  it('returns a status other than 403 if the user is signed in', async () => {
    const { userJwt } = await helperDB.createUser();

    requestBody = {
      title: faker.word.words(3),
      price: faker.number.float({ min: 100, max: 1000 }),
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    expect(response.status).not.toEqual(403);
  });

  it('returns an error if an invalid title is provided', async () => {
    const { userJwt } = await helperDB.createUser();

    requestBody = {
      title: '',
      price: faker.number.float({ min: 100, max: 1000 }),
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    expect(response.status).toEqual(400);
  });

  it('returns an error if an invalid price is provided', async () => {
    const { userJwt } = await helperDB.createUser();

    requestBody = {
      title: faker.word.words(3),
      price: -10,
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    expect(response.status).toEqual(400);
  });

  it('creates a ticket with valid inputs', async () => {
    const { userJwt, userId } = await helperDB.createUser();

    let tickets = await helperDB.DBservice.ticketModel.find({});
    expect(tickets.length).toEqual(0);

    requestBody = {
      title: faker.word.words(3),
      price: faker.number.float({ min: 100, max: 1000 }),
    };

    await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    await sleep(5000);

    tickets = await helperDB.DBservice.ticketModel.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(requestBody.price);
    expect(tickets[0].title).toEqual(requestBody.title);
    expect(tickets[0].userId).toEqual(userId);

    expect(helperKafka.kafkaMessages).toHaveLength(1);

    const ticketCreatedEvent = helperKafka
      .kafkaMessages[0] as TicketCreatedEvent;

    expect(ticketCreatedEvent.topic).toBe(TopicsEnum.ticket_created);
    expect(ticketCreatedEvent.value.id).toBe(tickets[0].id);
    expect(ticketCreatedEvent.value.title).toBe(tickets[0].title);
    expect(ticketCreatedEvent.value.price).toBe(tickets[0].price);
    expect(ticketCreatedEvent.value.userId).toBe(tickets[0].userId);
  });
});
