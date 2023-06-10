import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { AppModule } from '@tickethub/tickets/app/app.module';
import { setupApp } from '@tickethub/tickets/setup-app';
import { Helper } from '@tickethub/tickets/test/helper';
import { buildUrl } from '@tickethub/utils';
import { TICKET_NOT_FOUND } from '@tickethub/error';
import { GetTicketsRequestTickets } from '@tickethub/dto';

const url = '/';

describe('tickets(GET) api/tickets', () => {
  let app: INestApplication;
  let helper: Helper;
  let requestQuery: GetTicketsRequestTickets;

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
    helper.dropAllCollections();
  });

  afterAll(async () => {
    helper.closeConnection();
  });

  it('can fetch a list of tickets and consist of meta for pagination info', async () => {
    const { userId, userJwt } = await helper.createUser();
    const COUNT = 5;
    await helper.createMultipleTickets(COUNT, { userId });

    requestQuery = { limit: 5, page: 1 };

    const response = await request(app.getHttpServer())
      .get(buildUrl(url, {}, requestQuery))
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(200);

    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta.totalItems).toBe(COUNT);
    expect(response.body.meta.itemsPerPage).toBe(requestQuery.limit);
    expect(response.body.meta.currentPage).toBe(requestQuery.page);
  });

  it('can fetch a list of tickets and filter base on userId', async () => {
    const { userId, userJwt } = await helper.createUser();
    const COUNT = 5;
    await helper.createMultipleTickets(COUNT, { userId });
    await helper.createMultipleTickets(COUNT, {});

    requestQuery = { limit: 5, page: 1, userId };

    console.log({ url: buildUrl(url, {}, requestQuery) });

    const response = await request(app.getHttpServer())
      .get(buildUrl(url, {}, requestQuery))
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(200);

    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta.totalItems).toBe(COUNT);
    expect(response.body.meta.itemsPerPage).toBe(requestQuery.limit);
    expect(response.body.meta.currentPage).toBe(requestQuery.page);
  });
});
