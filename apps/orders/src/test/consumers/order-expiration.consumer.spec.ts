import { INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import * as error from '@tickethub/error';
import {
  OrderCancelledEvent,
  OrderExpirationEvent,
  OrderExpirationProducer,
  TopicsEnum,
} from '@tickethub/event';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { sleep } from '@tickethub/utils';
import { HelperDB } from '../helper.db';
import { HelperKafka } from '../helper.kafka';
import { OrderStatusEnum } from '@tickethub/enums';

jest.setTimeout(30000);
describe('orders(Cunsomer) order-expiration', () => {
  let app: INestApplication;
  let helperDB: HelperDB;
  let helperKafka: HelperKafka;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await setupApp(app);
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

  it('cancels an order with the given ID if the order is not completed yet and produces order_cancelled event', async () => {
    const { userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    const { order } = await helperDB.createOrder({
      ticket,
      userId,
      status: OrderStatusEnum.created,
    });

    const eventValue: OrderExpirationEvent['value'] = {
      id: order.id,
    };

    await new OrderExpirationProducer(
      helperKafka.kafkaService.producer
    ).produce(eventValue);

    await sleep();

    const updatedOrder = await helperDB.DBservice.orderModel.findById(order.id);
    expect(updatedOrder.status).toEqual(OrderStatusEnum.cancelled);

    expect(helperKafka.kafkaMessages).toHaveLength(1);
    const orderCancelledEvent = helperKafka
      .kafkaMessages[0] as OrderCancelledEvent;

    expect(orderCancelledEvent.topic).toBe(TopicsEnum.order_cancelled);
    expect(orderCancelledEvent.value.id).toBe(order.id);
    expect(orderCancelledEvent.value.ticket.id).toBe(ticket.id);
  });

  it("doesn't cancel an order  if the order is completed", async () => {
    const { userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    const { order } = await helperDB.createOrder({
      ticket,
      userId,
      status: OrderStatusEnum.complete,
    });

    const eventValue: OrderExpirationEvent['value'] = {
      id: order.id,
    };

    await new OrderExpirationProducer(
      helperKafka.kafkaService.producer
    ).produce(eventValue);

    await sleep();

    const updatedOrder = await helperDB.DBservice.orderModel.findById(order.id);
    expect(updatedOrder.status).toEqual(OrderStatusEnum.complete);

    expect(helperKafka.kafkaMessages).toHaveLength(0);
  });

  it('fails 404(ORDER_NOT_FOUND) if the order not found', async () => {
    const customErrorConstructorSpy = jest.spyOn(error, 'CustomError');
    const { userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    await helperDB.createOrder({
      ticket,
      userId,
      status: OrderStatusEnum.complete,
    });

    const eventValue: OrderExpirationEvent['value'] = {
      id: faker.database.mongodbObjectId(),
    };

    await new OrderExpirationProducer(
      helperKafka.kafkaService.producer
    ).produce(eventValue);

    await sleep();

    expect(customErrorConstructorSpy).toHaveBeenCalled();
    expect(customErrorConstructorSpy).toHaveBeenCalledWith(
      error.ORDER_NOT_FOUND
    );
  });
});
