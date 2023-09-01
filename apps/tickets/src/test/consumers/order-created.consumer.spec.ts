import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrderStatusEnum } from '@tickethub/enums';
import * as error from '@tickethub/error';
import { OrderCreatedEvent, OrderCreatedProducer } from '@tickethub/event';
import { AppModule } from '@tickethub/tickets/app/app.module';
import { setupApp } from '@tickethub/tickets/setup-app';
import { HelperDB } from '@tickethub/tickets/test/helper.db';
import { HelperKafka } from '@tickethub/tickets/test/helper.kafka';
import { sleep } from '@tickethub/utils';

jest.setTimeout(30000);
describe('tickets(Consumer) order-created', () => {
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

  it('creates an order with given id', async () => {
    const { ticket } = await helperDB.createTicket({});

    const eventValue: OrderCreatedEvent['value'] = {
      id: faker.database.mongodbObjectId(),
      status: OrderStatusEnum.created,
      userId: faker.database.mongodbObjectId(),
      expiresAt: faker.date.future(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    };

    await new OrderCreatedProducer(helperKafka.kafkaService.producer).produce(
      eventValue
    );

    await sleep();

    const updatedTicket = await helperDB.DBservice.ticketModel.findById(
      ticket.id
    );

    expect(updatedTicket.orderId).toBe(eventValue.id);
  });

  it('fails 404(TICKET_NOT_FOUND),if the ticket not found', async () => {
    const customErrorConstructorSpy = jest.spyOn(error, 'CustomError');

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

    expect(customErrorConstructorSpy).toHaveBeenCalled();
    expect(customErrorConstructorSpy).toHaveBeenCalledWith(
      error.TICKET_NOT_FOUND
    );
  });
});
