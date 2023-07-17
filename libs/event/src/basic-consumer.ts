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
    ) => Promise<void>
  ) {}

  async consume() {
    await this.kafkaConsumer.connect();
    await this.kafkaConsumer.subscribe({
      topics: [this.topic],
      fromBeginning: false,
    });
    await this.kafkaConsumer.run({
      autoCommit: false,
      eachMessage: async (payload: EachMessagePayload) => {
        await this.onMessage(
          this.parseMessage(payload.message),
          payload.topic as T['topic'],
          payload
        );

        await this.kafkaConsumer.commitOffsets([
          {
            topic: payload.topic,
            partition: payload.partition,
            offset: (Number(payload.message.offset) + 1).toString(),
          },
        ]);
      },
    });
  }

  parseMessage(kafkaMessage: KafkaMessage): T['value'] {
    return JSON.parse(kafkaMessage.value.toString());
  }
}
