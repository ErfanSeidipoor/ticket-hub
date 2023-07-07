import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { Helper } from '@tickethub/orders/test/helper';
import { buildUrl } from '@tickethub/utils';
import { ORDER_NOT_FOUND } from '@tickethub/error';

const url = '/:orderId';

describe('orders(GET) api/orders/:orderId', () => {
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

  it('returns the order if the order is found', async () => {
    const { userJwt, userId } = await helper.createUser();
    const { ticket } = await helper.createTicket({});
    const { order } = await helper.createOrder({ ticket, userId });

    const response = await request(app.getHttpServer())
      .get(buildUrl(url, { orderId: order.id }))
      .set('Cookie', [`jwt=${userJwt}`])
      .expect(200);

    expect(response.body.id).toEqual(order.id);
    expect(response.body.status).toEqual(order.status);
  });

  it('fails 404(ORDER_NOT_FOUND) if the order is not found', async () => {
    const { userJwt } = await helper.createUser();
    await helper.createTicket({});

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
    const { userJwt } = await helper.createUser();
    const { userId } = await helper.createUser();
    const { ticket } = await helper.createTicket({});
    const { order } = await helper.createOrder({ ticket, userId });

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
