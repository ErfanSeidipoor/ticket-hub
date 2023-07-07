import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { AppModule } from '@tickethub/tickets/app/app.module';
import { setupApp } from '@tickethub/tickets/setup-app';
import { Helper } from '@tickethub/tickets/test/helper';
import { CreateTicketRequestTickets } from '@tickethub/dto';
import { sleep } from '@tickethub/utils';
import { TopicsEnum } from '@tickethub/event';

const url = '/';
jest.setTimeout(30000);
describe('tickets(POST) api/tickets', () => {
  let app: INestApplication;
  let helper: Helper;
  let requestBody: CreateTicketRequestTickets;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    helper = new Helper(app);
    await helper.createTicketCreatedCunsomer();
  });

  beforeEach(async () => {
    await helper.dropAllCollections();
    helper.cleareMessages();
  });

  afterAll(async () => {
    await helper.closeConnection();
  });

  afterEach(async () => {
    await helper.cleareMessages();
  });

  it('returns a status other than 403 if the user is signed in', async () => {
    const { userJwt } = await helper.createUser();

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
    const { userJwt } = await helper.createUser();

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
    const { userJwt } = await helper.createUser();

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

  it.only('creates a ticket with valid inputs', async () => {
    const { userJwt, userId } = await helper.createUser();

    let tickets = await helper.DBservice.ticketModel.find({});
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

    tickets = await helper.DBservice.ticketModel.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(requestBody.price);
    expect(tickets[0].title).toEqual(requestBody.title);
    expect(tickets[0].userId).toEqual(userId);

    expect(helper.kafkaMessages).toHaveLength(1);

    const ticketCreatedEvent = helper.kafkaMessages[0];

    expect(ticketCreatedEvent.topic).toBe(TopicsEnum.ticket_created);
    expect(ticketCreatedEvent.value.id).toBe(tickets[0].id);
    expect(ticketCreatedEvent.value.title).toBe(tickets[0].title);
    expect(ticketCreatedEvent.value.price).toBe(tickets[0].price);
    expect(ticketCreatedEvent.value.userId).toBe(tickets[0].userId);
  });
});
