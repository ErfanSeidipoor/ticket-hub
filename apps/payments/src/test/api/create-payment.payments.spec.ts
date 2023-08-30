import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreatePaymentRequestPayments } from '@tickethub/dto';
import {
  ORDER_IS_NO_LONGER_AVAILABLE,
  ORDER_NOT_FOUND,
  STRIPE_TOKEN_IS_USED_BEFORE,
  STRIPE_TOKEN_NOT_FOUND,
} from '@tickethub/error';
import { TopicsEnum } from '@tickethub/event';
import { AppModule } from '@tickethub/payments/app/app.module';
import { setupApp } from '@tickethub/payments/setup-app';
import { sleep } from '@tickethub/utils';
import request from 'supertest';
import { HelperDB } from '../helper.db';
import { HelperKafka } from '../helper.kafka';
import { OrderStatusEnum } from '@tickethub/enums';

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

  it('returns a 404(ORDER_IS_NO_LONGER_AVAILABLE) when purchasing a cancelled order', async () => {
    const { userJwt, userId } = await helperDB.createUser();
    const { order } = await helperDB.createOrder({
      userId,
      status: OrderStatusEnum.cancelled,
    });

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

    expect(message).toEqual(ORDER_IS_NO_LONGER_AVAILABLE.description);
    expect(status).toEqual(ORDER_IS_NO_LONGER_AVAILABLE.status);
  });

  it('returns a 404(STRIPE_TOKEN_NOT_FOUND) when stripe token is invalid', async () => {
    const { userJwt, userId } = await helperDB.createUser();
    const { order } = await helperDB.createOrder({
      userId,
      status: OrderStatusEnum.created,
    });

    requestBody = {
      orderId: order.id,
      token: 'fake-token',
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(message).toEqual(STRIPE_TOKEN_NOT_FOUND.description);
    expect(status).toEqual(STRIPE_TOKEN_NOT_FOUND.status);
  });

  it('returns a 404(STRIPE_TOKEN_IS_USED_BEFORE) when stripe token is usd before', async () => {
    const { userJwt, userId } = await helperDB.createUser();
    const { order } = await helperDB.createOrder({ userId });
    const { payment } = await helperDB.createPayment({
      userId,
    });

    requestBody = {
      orderId: order.id,
      token: payment.token,
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(message).toEqual(STRIPE_TOKEN_IS_USED_BEFORE.description);
    expect(status).toEqual(STRIPE_TOKEN_IS_USED_BEFORE.status);
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

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    await sleep();

    const payment = await helperDB.DBservice.paymentModel.findOne({
      token: requestBody.token,
    });

    expect(payment).toBeDefined();
    expect(payment.stripeId).toBeDefined();

    expect(helperKafka.kafkaMessages).toHaveLength(1);

    const orderCreatedEvent = helperKafka.kafkaMessages[0];
    expect(orderCreatedEvent.topic).toBe(TopicsEnum.payment_created);
    expect(orderCreatedEvent.value.orderId).toBe(order.id);
    expect(orderCreatedEvent.value.paymentId).toBe(payment.id);
  });
});
