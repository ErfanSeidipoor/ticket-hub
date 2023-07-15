import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TicketCreatedEvent, TicketCreatedProducer } from '@tickethub/event';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { Helper } from '@tickethub/orders/test/helper';
import { sleep } from '@tickethub/utils';

describe('orders(Cunsomer) ticket-created', () => {
  let app: INestApplication;
  let helper: Helper;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await setupApp(app);
    await app.init();
    helper = new Helper(app);
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

  it('creates a ticket with given id', async () => {
    const eventValue: TicketCreatedEvent['value'] = {
      id: faker.database.mongodbObjectId(),
      title: faker.word.words(3),
      price: faker.number.float({ min: 100, max: 1000 }),
      userId: faker.database.mongodbObjectId(),
    };

    await new TicketCreatedProducer(helper.kafkaService.producer).produce(
      eventValue
    );

    await sleep();

    const ticket = await helper.DBservice.ticketModel.findById(eventValue.id);

    expect(ticket.price).toBe(eventValue.price);
    expect(ticket.title).toBe(eventValue.title);
  });
});
