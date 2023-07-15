import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../kafka/kafka.service';
import { TicketCreatedCunsomer } from '@tickethub/event';

@Injectable()
export class TicketCreatedCunsomerHandler implements OnModuleInit {
  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    const kafkaConsumer = await this.kafkaService.createConsumer();
    await new TicketCreatedCunsomer(kafkaConsumer, (message) => {
      console.log('new', { message });
    }).consume();
  }
}
