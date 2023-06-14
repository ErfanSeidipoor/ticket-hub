import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from '../kafka/consumer.service';

@Injectable()
export class CreateTicketConsumer implements OnModuleInit {
  constructor(private readonly _consumer: ConsumerService) {}

  async onModuleInit() {
    this._consumer.consume(
      { topics: ['tickets-create-ticket'] },
      {
        eachMessage: async ({ topic, partition, message }) => {
          console.log({
            source: 'tickets-create-ticket',
            message: message.value.toString(),
            partition: partition.toString(),
            topic: topic.toString(),
          });
        },
      }
    );
  }
}
