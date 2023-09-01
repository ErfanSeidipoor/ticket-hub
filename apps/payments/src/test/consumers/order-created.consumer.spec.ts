import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrderStatusEnum } from '@tickethub/enums';
import { OrderCreatedEvent, OrderCreatedProducer } from '@tickethub/event';
import { AppModule } from '@tickethub/payments/app/app.module';
import { setupApp } from '@tickethub/payments/setup-app';
import { HelperDB } from '@tickethub/payments/test/helper.db';
import { HelperKafka } from '@tickethub/payments/test/helper.kafka';
import { sleep } from '@tickethub/utils';

jest.setTimeout(30000);
describe('payments(Consumer) order-created', () => {
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

  it('replicates the order info', async () => {
    const eventValue: OrderCreatedEvent['value'] = {
      id: faker.database.mongodbObjectId(),
      status: OrderStatusEnum.created,
      userId: faker.database.mongodbObjectId(),
      expiresAt: faker.date.future(),
      ticket: {
        id: faker.database.mongodbObjectId(),
        price: faker.number.float({ min: 100, max: 1000 }),
      },
    };

    await new OrderCreatedProducer(helperKafka.kafkaService.producer).produce(
      eventValue
    );

    await sleep();

    const order = await helperDB.DBservice.orderModel.findById(eventValue.id);
    expect(order).toBeDefined();
    expect(order.userId).toBe(eventValue.userId);
    expect(order.price).toBe(eventValue.ticket.price);
    expect(order.status).toBe(eventValue.status);
    expect(order.status).toBe(eventValue.status);
  });
});
