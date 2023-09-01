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

export abstract class BasicConsumer<E extends Event[]> {
  abstract topics: E[number]['topic'][];

  constructor(
    private kafkaConsumer: KafkaConsumer,
    private onMessages: {
      [key in E[number]['topic']]: (
        data: E[number]['value'],
        topic: E[number]['topic'],
        payload: EachMessagePayload
      ) => Promise<void>;
    }
  ) {}

  async consume() {
    await this.kafkaConsumer.connect();
    await this.kafkaConsumer.subscribe({
      topics: this.topics,
      fromBeginning: false,
    });
    await this.kafkaConsumer.run({
      autoCommit: false,
      eachMessage: async (payload: EachMessagePayload) => {
        await this.onMessages[payload.topic](
          this.parseMessage(payload.message),
          payload.topic as Event['topic'],
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

  parseMessage(kafkaMessage: KafkaMessage): Event['value'] {
    return JSON.parse(kafkaMessage.value.toString());
  }
}
