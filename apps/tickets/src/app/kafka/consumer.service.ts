import { Injectable } from '@nestjs/common';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService {
  private readonly kafka = new Kafka({
    brokers: [process.env.KAFKA_URL],
  });
  private readonly consumers: Consumer[] = [];

  async consume(topics: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    const cosumer: Consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP,
    });
    await cosumer.connect();
    await cosumer.subscribe(topics);

    await cosumer.run(config);
    this.consumers.push(cosumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
