import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../kafka/kafka.service';
import { TicketUpdatedCunsomer } from '@tickethub/event';

@Injectable()
export class TicketUpdatedCunsomerHandler implements OnModuleInit {
  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new TicketUpdatedCunsomer(kafkaConsumer, (message) => {
      console.log('new updated', { message });
    }).consume();
  }
}
