import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TicketUpdatedEvent, TicketUpdatedProducer } from '@tickethub/event';
import { AppModule } from '@tickethub/orders/app/app.module';
import { setupApp } from '@tickethub/orders/setup-app';
import { Helper } from '@tickethub/orders/test/helper';
import { sleep } from '@tickethub/utils';

describe('orders(Cunsomer) ticket-updated', () => {
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

  it('updates title and price of ticket', async () => {
    const { ticket } = await helper.createTicket({});

    const eventValue: TicketUpdatedEvent['value'] = {
      id: ticket.id,
      title: faker.word.words(3),
      price: faker.number.float({ min: 100, max: 1000 }),
    };

    await new TicketUpdatedProducer(helper.kafkaService.producer).produce(
      eventValue
    );

    await sleep();

    const updatedTicket = await helper.DBservice.ticketModel.findById(
      eventValue.id
    );

    expect(updatedTicket.price).toBe(eventValue.price);
    expect(updatedTicket.title).toBe(eventValue.title);
  });
});
