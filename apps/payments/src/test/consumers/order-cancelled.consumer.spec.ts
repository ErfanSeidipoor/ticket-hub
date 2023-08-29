import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrderStatusEnum } from '@tickethub/enums';
import * as error from '@tickethub/error';
import { OrderCancelledEvent, OrderCancelledProducer } from '@tickethub/event';
import { AppModule } from '@tickethub/payments/app/app.module';
import { setupApp } from '@tickethub/payments/setup-app';
import { HelperDB } from '@tickethub/payments/test/helper.db';
import { HelperKafka } from '@tickethub/payments/test/helper.kafka';
import { sleep } from '@tickethub/utils';

jest.setTimeout(30000);
describe('payments(Cunsomer) order-cancelled', () => {
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
  });

  beforeEach(async () => {
    await helperDB.dropAllCollections();
    await helperKafka.cleareMessages();
  });

  afterAll(async () => {
    await helperDB.closeConnection();
    await helperKafka.cleareMessages();
  });

  it('updates the status of the order', async () => {
    const { order } = await helperDB.createOrder({});

    const eventValue: OrderCancelledEvent['value'] = {
      id: faker.database.mongodbObjectId(),
      ticket: {
        id: faker.database.mongodbObjectId(),
      },
    };
    await new OrderCancelledProducer(helperKafka.kafkaService.producer).produce(
      eventValue
    );

    await sleep();

    const updatedOrder = await helperDB.DBservice.orderModel.findById(order.id);

    expect(updatedOrder.status).toBe(OrderStatusEnum.cancelled);
  });

  it('fails 404(ORDER_NOT_FOUND) if the order not found', async () => {
    const customErrorConstructorSpy = jest.spyOn(error, 'CustomError');
    const eventValue: OrderCancelledEvent['value'] = {
      id: faker.database.mongodbObjectId(),
      ticket: {
        id: faker.database.mongodbObjectId(),
      },
    };
    await new OrderCancelledProducer(helperKafka.kafkaService.producer).produce(
      eventValue
    );

    await sleep();
    expect(customErrorConstructorSpy).toHaveBeenCalled();
    expect(customErrorConstructorSpy).toHaveBeenCalledWith(
      error.ORDER_NOT_FOUND
    );
  });
});
