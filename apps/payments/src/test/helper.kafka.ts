import { INestApplication } from '@nestjs/common';
import {
  BasicConsumer,
  PaymentCreatedEvent,
  TopicsEnum,
} from '@tickethub/event';
import { KafkaService } from '../app/kafka/kafka.service';

export class PaymentCreatedConsumer extends BasicConsumer<
  [PaymentCreatedEvent]
> {
  topics: [TopicsEnum.payment_created] = [TopicsEnum.payment_created];
}

export class HelperKafka {
  kafkaService: KafkaService;
  kafkaMessages: PaymentCreatedEvent[] = [];
  groupId = 'group-test';

  constructor(public app: INestApplication) {
    this.kafkaService = app.get<KafkaService>(KafkaService);
    this.kafkaMessages = [];
  }

  async cleareMessages() {
    this.kafkaMessages = [];

    for (const topic of this.kafkaService.requiredTopics) {
      const topicOffsets = await this.kafkaService.admin.fetchTopicOffsets(
        topic
      );

      for (const topicOffset of topicOffsets) {
        const { partition, low, high } = topicOffset;
        for (let offset = Number(low); offset <= Number(high); offset++) {
          await this.kafkaService.admin.deleteTopicRecords({
            topic,
            partitions: [
              {
                partition,
                offset: String(offset),
              },
            ],
          });
        }
      }
    }
  }

  async createPaymentCreatedConsumer() {
    await new PaymentCreatedConsumer(
      await this.kafkaService.createConsumer(this.groupId),
      {
        [TopicsEnum.payment_created]: async (value, topic) => {
          this.kafkaMessages.push({
            topic,
            value,
          });
        },
      }
    ).consume();
  }
}
