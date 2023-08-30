import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrderStatusEnum } from '@tickethub/enums';
import * as error from '@tickethub/error';
import { PaymentCreatedEvent, PaymentCreatedProducer } from '@tickethub/event';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { sleep } from '@tickethub/utils';
import { HelperDB } from '../helper.db';
import { HelperKafka } from '../helper.kafka';

jest.setTimeout(30000);
describe('orders(Cunsomer) payment-created', () => {
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

  it('changes status of an order to completed', async () => {
    const { userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    const { order } = await helperDB.createOrder({
      ticket,
      userId,
      status: OrderStatusEnum.created,
    });

    const eventValue: PaymentCreatedEvent['value'] = {
      orderId: order.id,
      paymentId: faker.database.mongodbObjectId(),
    };

    await new PaymentCreatedProducer(helperKafka.kafkaService.producer).produce(
      eventValue
    );

    await sleep();

    const updatedOrder = await helperDB.DBservice.orderModel.findById(order.id);
    expect(updatedOrder.status).toEqual(OrderStatusEnum.complete);
  });

  it('fails 404(ORDER_NOT_FOUND) if the order not found', async () => {
    const customErrorConstructorSpy = jest.spyOn(error, 'CustomError');
    const { userId } = await helperDB.createUser();
    const { ticket } = await helperDB.createTicket({});
    await helperDB.createOrder({
      ticket,
      userId,
      status: OrderStatusEnum.created,
    });

    const eventValue: PaymentCreatedEvent['value'] = {
      orderId: faker.database.mongodbObjectId(),
      paymentId: faker.database.mongodbObjectId(),
    };

    await new PaymentCreatedProducer(helperKafka.kafkaService.producer).produce(
      eventValue
    );

    await sleep();
    expect(customErrorConstructorSpy).toHaveBeenCalled();
    expect(customErrorConstructorSpy).toHaveBeenCalledWith(
      error.ORDER_NOT_FOUND
    );
  });
});
