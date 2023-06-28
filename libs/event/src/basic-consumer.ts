import {
  EachMessagePayload,
  Consumer as KafkaConsumer,
  KafkaMessage,
} from 'kafkajs';
import { TopicsEnum } from './topics.enum';

interface Event {
  topic: TopicsEnum;
  value: any;
}

export abstract class BasicCunsomer<T extends Event> {
  abstract topic: T['topic'];

  constructor(
    private kafkaConsumer: KafkaConsumer,
    private onMessage: (
      data: T['value'],
      topic: T['topic'],
      payload: EachMessagePayload
    ) => void
  ) {}

  async consume() {
    await this.kafkaConsumer.connect();
    await this.kafkaConsumer.subscribe({ topics: [this.topic] });
    await this.kafkaConsumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        this.onMessage(
          this.parseMessage(payload.message),
          payload.topic as T['topic'],
          payload
        );
      },
    });
  }

  parseMessage(kafkaMessage: KafkaMessage): T['value'] {
    return JSON.parse(kafkaMessage.value.toString());
  }
}
