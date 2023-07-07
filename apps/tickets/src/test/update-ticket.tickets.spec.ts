import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UpdateTicketRequestTickets } from '@tickethub/dto';
import { TICKET_NOT_FOUND } from '@tickethub/error';
import { TopicsEnum } from '@tickethub/event';
import { AppModule } from '@tickethub/tickets/app/app.module';
import { setupApp } from '@tickethub/tickets/setup-app';
import { Helper } from '@tickethub/tickets/test/helper';
import { buildUrl, sleep } from '@tickethub/utils';
import request from 'supertest';

jest.setTimeout(30000);

const url = '/:ticketId';

describe('tickets(PUT) api/tickets/:ticketId', () => {
  let app: INestApplication;
  let helper: Helper;
  let requestBody: UpdateTicketRequestTickets;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    helper = new Helper(app);
    await helper.createTicketUpdatedCunsomer();
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

  it('returns a 403 if the user is not authenticated', async () => {
    const { userId } = await helper.createUser();
    const { ticket } = await helper.createTicket({ userId });

    requestBody = {
      title: faker.word.words(3),
      price: faker.number.float({ min: 100, max: 1000 }),
    };

    await request(app.getHttpServer())
      .put(buildUrl(url, { ticketId: ticket.id }))
      .send(requestBody)
      .expect(403);
  });

  it.only('updates the ticket provided valid inputs', async () => {
    const { userJwt, userId } = await helper.createUser();
    const { ticket } = await helper.createTicket({ userId });

    requestBody = {
      title: faker.word.words(3),
      price: faker.number.float({ min: 100, max: 1000 }),
    };

    const response = await request(app.getHttpServer())
      .put(buildUrl(url, { ticketId: ticket.id }))
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody)
      .expect(200);

    await sleep(5000);

    expect(response.body.title).toEqual(requestBody.title);
    expect(response.body.price).toEqual(requestBody.price);

    const updatedTicket = await helper.DBservice.ticketModel.findById(
      ticket.id
    );

    expect(updatedTicket.title).toEqual(requestBody.title);
    expect(updatedTicket.price).toEqual(requestBody.price);

    expect(helper.kafkaMessages).toHaveLength(1);
    const ticketUpdatedEvent = helper.kafkaMessages[0];

    expect(ticketUpdatedEvent.topic).toBe(TopicsEnum.ticket_updated);
    expect(ticketUpdatedEvent.value.id).toBe(updatedTicket.id);
    expect(ticketUpdatedEvent.value.title).toBe(updatedTicket.title);
    expect(ticketUpdatedEvent.value.price).toBe(updatedTicket.price);
    expect(ticketUpdatedEvent.value.userId).toBe(updatedTicket.userId);
  });

  it('returns a 404(TICKET_NOT_FOUND) if the user does not own the ticket', async () => {
    const { userJwt } = await helper.createUser();
    const { ticket } = await helper.createTicket({});

    requestBody = {
      title: faker.word.words(3),
      price: faker.number.float({ min: 100, max: 1000 }),
    };

    const response = await request(app.getHttpServer())
      .put(buildUrl(url, { ticketId: ticket.id }))
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(TICKET_NOT_FOUND.status);
    expect(message).toEqual(TICKET_NOT_FOUND.description);
  });

  it('returns a 400 if the user provides an invalid title or price', async () => {
    const { userJwt } = await helper.createUser();
    const { ticket } = await helper.createTicket({});

    requestBody = {
      title: faker.word.words(3),
      price: -10,
    };

    await request(app.getHttpServer())
      .put(buildUrl(url, { ticketId: ticket.id }))
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(400);

    requestBody = {
      title: '',
      price: faker.number.float({ min: 100, max: 1000 }),
    };

    await request(app.getHttpServer())
      .put(buildUrl(url, { ticketId: ticket.id }))
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(400);
  });
});
