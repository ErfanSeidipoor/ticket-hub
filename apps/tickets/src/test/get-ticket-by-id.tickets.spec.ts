import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { AppModule } from '@tickethub/tickets/app/app.module';
import { setupApp } from '@tickethub/tickets/setup-app';
import { Helper } from '@tickethub/tickets/test/helper';
import { buildUrl } from '@tickethub/utils';
import { TICKET_NOT_FOUND } from '@tickethub/error';

const url = '/:ticketId';

describe('tickets(GET) api/tickets/:ticketId', () => {
  let app: INestApplication;
  let helper: Helper;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    helper = new Helper(app);
  });

  beforeEach(async () => {
    await helper.dropAllCollections();
  });

  afterAll(async () => {
    await helper.closeConnection();
  });

  it('returns the ticket if the ticket is found', async () => {
    const { userJwt } = await helper.createUser();
    const { ticket } = await helper.createTicket({});

    const response = await request(app.getHttpServer())
      .get(buildUrl(url, { ticketId: ticket.id }))
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(200);

    expect(response.body.price).toEqual(ticket.price);
    expect(response.body.id).toEqual(ticket.id);
    expect(response.body.title).toEqual(ticket.title);
  });

  it('fails 404(TICKET_NOT_FOUND) the ticket not found', async () => {
    const { userJwt } = await helper.createUser();
    await helper.createTicket({});

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
