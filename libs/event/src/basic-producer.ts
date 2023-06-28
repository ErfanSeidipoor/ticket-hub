import { Producer as KafkaProducer } from 'kafkajs';
import { TopicsEnum } from './topics.enum';

interface Event {
  topic: TopicsEnum;
  value: any;
}

export abstract class BasicProducer<T extends Event> {
  abstract topic: T['topic'];
  private kafkaProducer: KafkaProducer;

  constructor(kafkaProducer: KafkaProducer) {
    this.kafkaProducer = kafkaProducer;
  }

  async produce(value: T['value'], key?: string): Promise<void> {
    await this.kafkaProducer.send({
      topic: this.topic,
      messages: [{ value: JSON.stringify(value), key }],
    });
  }
}
