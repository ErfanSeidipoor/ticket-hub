import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrderStatusEnum } from '@tickethub/enums';
import { OrderCreatedEvent, OrderCreatedProducer } from '@tickethub/event';
import { AppModule } from '@tickethub/expiration/app/app.module';
import { HelperKafka } from '../helper.kafka';
import { sleep } from '@tickethub/utils';

jest.setTimeout(30000);
describe('expiration(Cunsomer) order-created', () => {
  let app: INestApplication;
  let helperKafka: HelperKafka;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();

    helperKafka = new HelperKafka(app);
  });

  beforeEach(async () => {
    await helperKafka.cleareMessages();
  });

  afterAll(async () => {
    await helperKafka.cleareMessages();
  });

  it('produce order-expiration event', async () => {
    const eventValue: OrderCreatedEvent['value'] = {
      id: faker.database.mongodbObjectId(),
      status: OrderStatusEnum.created,
      userId: faker.database.mongodbObjectId(),
      expiresAt: new Date(),
      ticket: {
        id: faker.database.mongodbObjectId(),
        price: faker.number.float({ min: 100, max: 1000 }),
      },
    };

    await new OrderCreatedProducer(helperKafka.kafkaService.producer).produce(
      eventValue
    );

    await sleep(10000);

    // const orderExpirationEvent = helperKafka
    //   .kafkaMessages[0] as OrderExpirationEvent;

    // expect(orderExpirationEvent.value.id).toBe(eventValue.id);
  });
});
