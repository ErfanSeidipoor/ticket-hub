import { INestApplication } from '@nestjs/common';
import {
  BasicCunsomer,
  TicketCreatedEvent,
  TicketUpdatedEvent,
  TopicsEnum,
} from '@tickethub/event';
import { KafkaService } from '../app/kafka/kafka.service';

export class TicketCreatedCunsomer extends BasicCunsomer<[TicketCreatedEvent]> {
  topics: [TopicsEnum.ticket_created] = [TopicsEnum.ticket_created];
}
export class TicketUpdatedCunsomer extends BasicCunsomer<[TicketUpdatedEvent]> {
  topics: [TopicsEnum.ticket_updated] = [TopicsEnum.ticket_updated];
}

export class HelperKafka {
  kafkaService: KafkaService;
  kafkaMessages: (TicketCreatedEvent | TicketUpdatedEvent)[] = [];
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

  async createTicketUpdatedCunsomer() {
    await new TicketUpdatedCunsomer(
      await this.kafkaService.createConsumer(this.groupId),
      {
        [TopicsEnum.ticket_updated]: async (value, topic) => {
          this.kafkaMessages.push({
            topic,
            value,
          });
        },
      }
    ).consume();
  }

  async createTicketCreatedCunsomer() {
    await new TicketCreatedCunsomer(
      await this.kafkaService.createConsumer(this.groupId),
      {
        [TopicsEnum.ticket_created]: async (value, topic) => {
          this.kafkaMessages.push({
            topic,
            value,
          });
        },
      }
    ).consume();
  }
}
