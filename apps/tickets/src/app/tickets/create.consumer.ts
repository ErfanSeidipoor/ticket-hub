import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class CreateTicketConsumer implements OnModuleInit {
  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    this.kafkaService.consume(
      { topics: ['tickets-create-ticket'], },
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
