import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GetTicketsRequestTickets } from '@tickethub/dto';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { Helper } from '@tickethub/orders/test/helper';
import { buildUrl } from '@tickethub/utils';
import request from 'supertest';

const url = '/';

describe('orders(GET) api/orders', () => {
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
    await helper.dropAllCollections();
  });

  afterAll(async () => {
    await helper.closeConnection();
  });

  it('can fetch a list of orders and consist of meta for pagination info', async () => {
    const { userId, userJwt } = await helper.createUser();
    const COUNT = 5;
    await helper.createMultipleOrders(COUNT, { userId });

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

  it('can fetch a list of orders and filter base on userId', async () => {
    const { userId, userJwt } = await helper.createUser();
    const COUNT = 5;
    await helper.createMultipleOrders(COUNT, { userId });
    await helper.createMultipleOrders(COUNT, {});

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
