import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@tickethub/tickets/app/app.module';
import { setupApp } from '@tickethub/tickets/setup-app';
import { HelperDB } from '../helper.db';
import { buildUrl } from '@tickethub/utils';
import { GetTicketsRequestTickets } from '@tickethub/dto';

const url = '/';
jest.setTimeout(30000);
describe('tickets(GET) api/tickets', () => {
  let app: INestApplication;
  let helperDB: HelperDB;
  let requestQuery: GetTicketsRequestTickets;

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

  it('can fetch a list of tickets and consist of meta for pagination info', async () => {
    const { userId, userJwt } = await helperDB.createUser();
    const COUNT = 5;
    await helperDB.createMultipleTickets(COUNT, { userId });

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
    const { userId, userJwt } = await helperDB.createUser();
    const COUNT = 5;
    await helperDB.createMultipleTickets(COUNT, { userId });
    await helperDB.createMultipleTickets(COUNT, {});

    requestQuery = { limit: 5, page: 1, userId };

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
