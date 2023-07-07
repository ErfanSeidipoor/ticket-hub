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
import { Helper } from '@tickethub/orders/test/helper';
import { sleep } from '@tickethub/utils';
import request from 'supertest';

const url = '/';
jest.setTimeout(30000);
describe('orders(POST) api/orders', () => {
  let app: INestApplication;
  let helper: Helper;
  let requestBody: CreateOrderRequestOrders;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    helper = new Helper(app);
    await helper.createOrderCreatedCunsomer();
  });

  beforeEach(async () => {
    await helper.dropAllCollections();
    helper.cleareMessages();
  });

  afterAll(async () => {
    await helper.closeConnection();
  });

  afterEach(async () => {
    await helper.cleareMessages();
  });

  it('returns a status other than 403 if the user is signed in', async () => {
    const { userJwt } = await helper.createUser();
    const { ticket } = await helper.createTicket({});

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
    const { userJwt } = await helper.createUser();

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
    const { userJwt } = await helper.createUser();

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
    const { userJwt, userId } = await helper.createUser();
    const { ticket } = await helper.createTicket({});
    await helper.createOrder({
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
    const { userJwt, userId } = await helper.createUser();
    const { ticket } = await helper.createTicket({});

    let orders = await helper.DBservice.orderModel.find({});
    expect(orders.length).toEqual(0);

    requestBody = {
      ticketId: ticket.id,
    };

    await request(app.getHttpServer())
      .post(url)
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    await sleep(5000);

    orders = await helper.DBservice.orderModel.find({}).populate('ticket');

    expect(orders.length).toEqual(1);

    const order = orders[0];
    expect(order.status).toEqual(OrderStatusEnum.created);
    expect(order.ticket.id).toEqual(ticket.id);
    expect(order.userId).toEqual(userId);

    expect(helper.kafkaMessages).toHaveLength(1);

    const orderCreatedEvent = helper.kafkaMessages[0] as OrderCreatedEvent;
    expect(orderCreatedEvent.topic).toBe(TopicsEnum.order_created);
    expect(orderCreatedEvent.value.id).toBe(order.id);
    expect(orderCreatedEvent.value.status).toBe(OrderStatusEnum.created);
    expect(orderCreatedEvent.value.userId).toBe(userId);
    expect(orderCreatedEvent.value.ticket.id).toBe(ticket.id);
    expect(orderCreatedEvent.value.ticket.price).toBe(ticket.price);
  });
});
