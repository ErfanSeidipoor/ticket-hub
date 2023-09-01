import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrderStatusEnum } from '@tickethub/enums';

import {
  OrderCreatedEvent,
  OrderCreatedProducer,
  OrderExpirationEvent,
} from '@tickethub/event';
import { AppModule } from '@tickethub/expiration/app/app.module';
import { HelperKafka } from '../helper.kafka';
import { HelperBull } from '../helper.bull';
import { sleep } from '@tickethub/utils';

jest.setTimeout(30000);
describe('expiration(Consumer) order-created', () => {
  let app: INestApplication;
  let helperKafka: HelperKafka;
  let helperBull: HelperBull;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();

    helperKafka = new HelperKafka(app);
    helperBull = new HelperBull(app);

    await helperKafka.createOrderExpirationConsumer();
  });

  beforeEach(async () => {
    await helperKafka.cleareMessages();
    await helperBull.emptyJobs();
  });

  afterAll(async () => {
    await helperKafka.cleareMessages();
    await helperBull.emptyJobs();
  });

  it('produce order-expiration event', async () => {
    const expiresAt = new Date(new Date().getTime() + 10 * 1000);

    const eventValue: OrderCreatedEvent['value'] = {
      id: faker.database.mongodbObjectId(),
      status: OrderStatusEnum.created,
      userId: faker.database.mongodbObjectId(),
      expiresAt,
      ticket: {
        id: faker.database.mongodbObjectId(),
        price: faker.number.float({ min: 100, max: 1000 }),
      },
    };

    await new OrderCreatedProducer(helperKafka.kafkaService.producer).produce(
      eventValue
    );

    await sleep(4000);

    // before expiration
    expect(helperKafka.kafkaMessages).toHaveLength(0);

    await sleep(7000);

    // after expiration
    const orderExpirationEvent = helperKafka
      .kafkaMessages[0] as OrderExpirationEvent;

    expect(orderExpirationEvent.value.id).toBe(eventValue.id);
  });
});
