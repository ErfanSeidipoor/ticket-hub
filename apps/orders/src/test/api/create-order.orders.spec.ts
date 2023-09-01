import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateOrderRequestOrders } from '@tickethub/dto';
import { OrderStatusEnum } from '@tickethub/enums';
import {
  TICKET_IS_ALREADY_RESERVED_FOUND,
  TICKET_NOT_FOUND,
} from '@tickethub/error';
import { OrderCreatedEvent, TopicsEnum } from '@tickethub/event';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { sleep } from '@tickethub/utils';
import request from 'supertest';
import { HelperDB } from '../helper.db';
import { HelperKafka } from '../helper.kafka';

const url = '/';
jest.setTimeout(30000);
describe('orders(POST) api/orders', () => {
  let app: INestApplication;
  let helperDB: HelperDB;
  let helperKafka: HelperKafka;
  let requestBody: CreateOrderRequestOrders;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();

    helperDB = new HelperDB(app);
    helperKafka = new HelperKafka(app);

    await helperKafka.createOrderCreatedConsumer();
  });

  beforeEach(async () => {
    await helperDB.dropAllCollections();
    await helperKafka.cleareMessages();
  });

  afterAll(async () => {
    await helperDB.closeConnection();
    await helperKafka.cleareMessages();
  });

  it('returns a status other than 403 if the user is signed in', async () => {
    const { userJwt } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});

    requestBody = {
      ticketId: ticket.id,
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    expect(response.status).not.toEqual(403);
  });

  it('returns an error if an invalid body is provided', async () => {
    const { userJwt } = await helperDB.createUser();

    requestBody = {
      ticketId: '',
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    expect(response.status).toEqual(400);
  });

  it('returns a 404(TICKET_NOT_FOUND) if ticket not found', async () => {
    const { userJwt } = await helperDB.createUser();

    requestBody = {
      ticketId: faker.database.mongodbObjectId(),
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(TICKET_NOT_FOUND.status);
    expect(message).toEqual(TICKET_NOT_FOUND.description);
  });

  it('returns a 404(TICKET_IS_ALREADY_RESERVED_FOUND) if ticket reserved before', async () => {
    const { userJwt, userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    await helperDB.createOrder({
      userId,
      ticket,
      status: OrderStatusEnum.awaiting_payment,
    });

    requestBody = {
      ticketId: ticket.id,
    };

    const response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(TICKET_IS_ALREADY_RESERVED_FOUND.status);
    expect(message).toEqual(TICKET_IS_ALREADY_RESERVED_FOUND.description);
  });

  it('creates an order with valid inputs', async () => {
    const { userJwt, userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});

    let orders = await helperDB.DBservice.orderModel.find({});
    expect(orders.length).toEqual(0);

    requestBody = {
      ticketId: ticket.id,
    };

    await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    await sleep(5000);

    orders = await helperDB.DBservice.orderModel.find({}).populate('ticket');

    expect(orders.length).toEqual(1);

    const order = orders[0];
    expect(order.status).toEqual(OrderStatusEnum.created);
    expect(order.ticket.id).toEqual(ticket.id);
    expect(order.userId).toEqual(userId);

    expect(helperKafka.kafkaMessages).toHaveLength(1);

    const orderCreatedEvent = helperKafka.kafkaMessages[0] as OrderCreatedEvent;
    expect(orderCreatedEvent.topic).toBe(TopicsEnum.order_created);
    expect(orderCreatedEvent.value.id).toBe(order.id);
    expect(orderCreatedEvent.value.status).toBe(OrderStatusEnum.created);
    expect(orderCreatedEvent.value.userId).toBe(userId);
    expect(orderCreatedEvent.value.ticket.id).toBe(ticket.id);
    expect(orderCreatedEvent.value.ticket.price).toBe(ticket.price);
  });
});
