import { INestApplication } from '@nestjs/common';
import {
  BasicCunsomer,
  OrderCancelledEvent,
  OrderCreatedEvent,
  TopicsEnum,
} from '@tickethub/event';
import { KafkaService } from '../app/kafka/kafka.service';

export class OrderCreatedCunsomer extends BasicCunsomer<[OrderCreatedEvent]> {
  topics: [TopicsEnum.order_created] = [TopicsEnum.order_created];
}
export class OrderCancelledCunsomer extends BasicCunsomer<
  [OrderCancelledEvent]
> {
  topics: [TopicsEnum.order_cancelled] = [TopicsEnum.order_cancelled];
}

export class HelperKafka {
  kafkaService: KafkaService;
  kafkaMessages: (OrderCreatedEvent | OrderCancelledEvent)[] = [];
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

  async createOrderCancelledCunsomer() {
    await new OrderCancelledCunsomer(
      await this.kafkaService.createConsumer(this.groupId),
      {
        [TopicsEnum.order_cancelled]: async (value, topic) => {
          this.kafkaMessages.push({
            topic,
            value,
          });
        },
      }
    ).consume();
  }
  async createOrderCreatedCunsomer() {
    await new OrderCreatedCunsomer(
      await this.kafkaService.createConsumer(this.groupId),
      {
        [TopicsEnum.order_created]: async (value, topic) => {
          this.kafkaMessages.push({
            topic,
            value,
          });
        },
      }
    ).consume();
  }
}
