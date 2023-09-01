import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TicketCreatedEvent, TicketCreatedProducer } from '@tickethub/event';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { sleep } from '@tickethub/utils';
import { HelperDB } from '../helper.db';
import { HelperKafka } from '../helper.kafka';

jest.setTimeout(30000);
describe('orders(Consumer) ticket-created', () => {
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

  it('creates a ticket with given id', async () => {
    const eventValue: TicketCreatedEvent['value'] = {
      id: faker.database.mongodbObjectId(),
      title: faker.word.words(3),
      price: faker.number.float({ min: 100, max: 1000 }),
      userId: faker.database.mongodbObjectId(),
    };
    await new TicketCreatedProducer(helperKafka.kafkaService.producer).produce(
      eventValue
    );
    await sleep();
    const ticket = await helperDB.DBservice.ticketModel.findById(eventValue.id);
    expect(ticket.price).toBe(eventValue.price);
    expect(ticket.title).toBe(eventValue.title);
  });
});
