import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { HelperDB } from '../helper.db';
import { buildUrl } from '@tickethub/utils';
import { ORDER_NOT_FOUND } from '@tickethub/error';

jest.setTimeout(30000);

const url = '/:orderId';
describe('orders(GET) api/orders/:orderId', () => {
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

  it('returns the order if the order is found', async () => {
    const { userJwt, userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    const { order } = await helperDB.createOrder({ ticket, userId });

    const response = await request(app.getHttpServer())
      .get(buildUrl(url, { orderId: order.id }))
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(200);

    expect(response.body.id).toEqual(order.id);
    expect(response.body.status).toEqual(order.status);
  });

  it('fails 404(ORDER_NOT_FOUND) if the order not found', async () => {
    const { userJwt } = await helperDB.createUser();
    await helperDB.createTicket({});

    const response = await request(app.getHttpServer())
      .get(buildUrl(url, { orderId: faker.database.mongodbObjectId() }))
      .set('Cookie', [`jwt=${userJwt}`]);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(ORDER_NOT_FOUND.status);
    expect(message).toEqual(ORDER_NOT_FOUND.description);
  });

  it('fails 404(ORDER_NOT_FOUND) if the order is not for that user', async () => {
    const { userJwt } = await helperDB.createUser();
    const { userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    const { order } = await helperDB.createOrder({ ticket, userId });

    const response = await request(app.getHttpServer())
      .get(buildUrl(url, { orderId: order.id }))
      .set('Cookie', [`jwt=${userJwt}`]);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(ORDER_NOT_FOUND.status);
    expect(message).toEqual(ORDER_NOT_FOUND.description);
  });
});
