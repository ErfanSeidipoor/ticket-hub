import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreatePaymentRequestPayments } from '@tickethub/dto';
import {
  ORDER_IS_NO_LONGER_AVAILABLE_FOUND,
  ORDER_NOT_FOUND,
} from '@tickethub/error';
import { TopicsEnum } from '@tickethub/event';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { sleep } from '@tickethub/utils';
import request from 'supertest';
import { HelperDB } from '../helper.db';
import { HelperKafka } from '../helper.kafka';

const url = '/';
jest.setTimeout(30000);

const STRIPE_FAKE_TOKEN = 'tok_visa';

describe('payments(POST) api/payments', () => {
  let app: INestApplication;
  let helperDB: HelperDB;
  let helperKafka: HelperKafka;
  let requestBody: CreatePaymentRequestPayments;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();

    helperDB = new HelperDB(app);
    helperKafka = new HelperKafka(app);

    await helperKafka.createPaymentCreatedCunsomer();
  });

  beforeEach(async () => {
    await helperDB.dropAllCollections();
    await helperKafka.cleareMessages();
  });

  afterAll(async () => {
    await helperDB.closeConnection();
    await helperKafka.cleareMessages();
  });

  it('returns a 404(ORDER_NOT_FOUND) if order not found', async () => {
    const { userJwt } = await helperDB.createUser();

    requestBody = {
      orderId: faker.database.mongodbObjectId(),
      token: STRIPE_FAKE_TOKEN,
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(ORDER_NOT_FOUND.status);
    expect(message).toEqual(ORDER_NOT_FOUND.description);
  });

  it("returns a 404(ORDER_NOT_FOUND) if order doesn't belong to the user", async () => {
    const { userJwt } = await helperDB.createUser();
    const { order } = await helperDB.createOrder({});

    requestBody = {
      orderId: order.id,
      token: STRIPE_FAKE_TOKEN,
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(ORDER_NOT_FOUND.status);
    expect(message).toEqual(ORDER_NOT_FOUND.description);
  });

  it('returns a 404(ORDER_IS_NO_LONGER_AVAILABLE_FOUND) when purchasing a cancelled order', async () => {
    const { userJwt } = await helperDB.createUser();
    const { order } = await helperDB.createOrder({});

    requestBody = {
      orderId: order.id,
      token: STRIPE_FAKE_TOKEN,
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(ORDER_IS_NO_LONGER_AVAILABLE_FOUND.status);
    expect(message).toEqual(ORDER_IS_NO_LONGER_AVAILABLE_FOUND.description);
  });

  it('creates an payment with valid inputs', async () => {
    const { userJwt, userId } = await helperDB.createUser();
    const { order } = await helperDB.createOrder({ userId });

    const payments = await helperDB.DBservice.paymentModel.find({});
    expect(payments.length).toEqual(0);

    requestBody = {
      token: STRIPE_FAKE_TOKEN,
      orderId: order.id,
    };

    await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    await sleep();

    const payment = await helperDB.DBservice.paymentModel.findOne({
      orderId: order.id,
    });
    expect(payment.stripeId).toBeDefined();

    expect(helperKafka.kafkaMessages).toHaveLength(1);

    const orderCreatedEvent = helperKafka.kafkaMessages[0];
    expect(orderCreatedEvent.topic).toBe(TopicsEnum.payment_created);
    expect(orderCreatedEvent.value.orderId).toBe(order.id);
    expect(orderCreatedEvent.value.paymentId).toBe(payment.id);
  });
});
