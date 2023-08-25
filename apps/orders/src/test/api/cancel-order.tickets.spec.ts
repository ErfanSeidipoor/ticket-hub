import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UpdateTicketRequestTickets } from '@tickethub/dto';
import { OrderStatusEnum } from '@tickethub/enums';
import { ORDER_NOT_FOUND } from '@tickethub/error';
import { OrderCancelledEvent, TopicsEnum } from '@tickethub/event';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { HelperDB } from '../helper.db';
import { HelperKafka } from '../helper.kafka';
import { buildUrl, sleep } from '@tickethub/utils';
import request from 'supertest';

jest.setTimeout(30000);

const url = '/:orderId';

describe('orders(PUT) api/orders/:orderId', () => {
  let app: INestApplication;
  let helperDB: HelperDB;
  let helperKafka: HelperKafka;
  let requestBody: UpdateTicketRequestTickets;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();

    helperDB = new HelperDB(app);
    helperKafka = new HelperKafka(app);

    await helperKafka.createOrderCancelledCunsomer();
  });

  beforeEach(async () => {
    await helperDB.dropAllCollections();
    await helperKafka.cleareMessages();
  });

  afterAll(async () => {
    await helperDB.closeConnection();
    await helperKafka.cleareMessages();
  });

  it('returns a 403 if the user is not authenticated', async () => {
    const { userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    await helperDB.createOrder({ ticket, userId });

    await request(app.getHttpServer())
      .delete(buildUrl(url, { ticketId: ticket.id }))
      .send(requestBody)
      .expect(403);
  });

  it('updates the ticket provided valid inputs', async () => {
    const { userJwt, userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    const { order } = await helperDB.createOrder({ ticket, userId });

    const response = await request(app.getHttpServer())
      .delete(buildUrl(url, { orderId: order.id }))
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody)
      .expect(200);

    await sleep(5000);

    const updatedOrder = await helperDB.DBservice.orderModel.findById(order.id);
    expect(updatedOrder.status).toEqual(OrderStatusEnum.cancelled);

    expect(helperKafka.kafkaMessages).toHaveLength(1);
    const orderCancelledEvent = helperKafka
      .kafkaMessages[0] as OrderCancelledEvent;

    expect(orderCancelledEvent.topic).toBe(TopicsEnum.order_cancelled);
    expect(orderCancelledEvent.value.id).toBe(order.id);
    expect(orderCancelledEvent.value.ticket.id).toBe(ticket.id);
  });

  it('returns a 404(ORDER_NOT_FOUND) if orderId is incorrect', async () => {
    const { userJwt } = await helperDB.createUser();

    const response = await request(app.getHttpServer())
      .delete(buildUrl(url, { orderId: faker.database.mongodbObjectId() }))
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(ORDER_NOT_FOUND.status);
    expect(message).toEqual(ORDER_NOT_FOUND.description);
  });

  it('returns a 404(ORDER_NOT_FOUND) if the user does not own the ticket', async () => {
    const { userJwt, userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    const { order } = await helperDB.createOrder({ ticket });

    const response = await request(app.getHttpServer())
      .delete(buildUrl(url, { orderId: order.id }))
      .set('Cookie', [`jwt=${userJwt}`])
      .send(requestBody);

    const {
      body: { message },
      status,
    } = response;

    expect(status).toEqual(ORDER_NOT_FOUND.status);
    expect(message).toEqual(ORDER_NOT_FOUND.description);
  });
});
