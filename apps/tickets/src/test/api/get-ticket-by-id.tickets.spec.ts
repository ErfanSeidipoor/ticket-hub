import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { AppModule } from '@tickethub/tickets/app/app.module';
import { setupApp } from '@tickethub/tickets/setup-app';
import { buildUrl } from '@tickethub/utils';
import { TICKET_NOT_FOUND } from '@tickethub/error';
import { HelperDB } from '../helper.db';

const url = '/:ticketId';
jest.setTimeout(30000);
describe('tickets(GET) api/tickets/:ticketId', () => {
  let app: INestApplication;
  let helperDB: HelperDB;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    helperDB = new HelperDB(app);
  });

  beforeEach(async () => {
    await helperDB.dropAllCollections();
  });

  afterAll(async () => {
    await helperDB.closeConnection();
  });

  it('returns the ticket if the ticket is found', async () => {
    const { userJwt } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});

    const response = await request(app.getHttpServer())
      .get(buildUrl(url, { ticketId: ticket.id }))
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(200);

    expect(response.body.price).toEqual(ticket.price);
    expect(response.body.id).toEqual(ticket.id);
    expect(response.body.title).toEqual(ticket.title);
  });

  it('fails 404(TICKET_NOT_FOUND) the ticket not found', async () => {
    const { userJwt } = await helperDB.createUser();
    await helperDB.createTicket({});

    const response = await request(app.getHttpServer())
      .get(buildUrl(url, { ticketId: faker.database.mongodbObjectId() }))
      .set('Cookie', [`jwt=${userJwt}`]);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(TICKET_NOT_FOUND.status);
    expect(message).toEqual(TICKET_NOT_FOUND.description);
  });
});
