import { INestApplication } from '@nestjs/common';
import {
  BasicConsumer,
  OrderExpirationEvent,
  TopicsEnum,
} from '@tickethub/event';
import { KafkaService } from '../app/kafka/kafka.service';

export class OrderExpirationConsumer extends BasicConsumer<
  [OrderExpirationEvent]
> {
  topics: [TopicsEnum.order_expiration] = [TopicsEnum.order_expiration];
}

export class HelperKafka {
  kafkaService: KafkaService;
  kafkaMessages: OrderExpirationEvent[] = [];
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

  async createOrderExpirationConsumer() {
    await new OrderExpirationConsumer(
      await this.kafkaService.createConsumer(this.groupId),
      {
        [TopicsEnum.order_expiration]: async (value, topic) => {
          this.kafkaMessages.push({
            topic,
            value,
          });
        },
      }
    ).consume();
  }
}
