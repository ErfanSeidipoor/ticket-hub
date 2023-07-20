import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { TopicsEnum } from '@tickethub/event';
import {
  Admin,
  Consumer,
  Kafka,
  Partitioners,
  Producer,
  ProducerRecord,
} from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: [process.env.KAFKA_URL as string],
  });

  public readonly requiredTopics = [
    TopicsEnum.ticket_created,
    TopicsEnum.ticket_updated,
    TopicsEnum.order_created,
    TopicsEnum.order_cancelled,
  ];

  public readonly admin: Admin = this.kafka.admin();

  private readonly consumers: Consumer[] = [];

  public readonly producer: Producer = this.kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  async onModuleInit() {
    await this.admin.describeGroups([process.env.KAFKA_GROUP, 'group-test']);
    await this.producer.connect();
    const topics = await this.admin.listTopics();
    for (const requiredTopic of this.requiredTopics) {
      if (!topics.includes(requiredTopic)) {
        await this.admin.createTopics({
          topics: [{ topic: requiredTopic }],
        });
      }
    }
  }

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }

  async createConsumer(groupId?: string) {
    const kafka = new Kafka({
      brokers: [process.env.KAFKA_URL as string],
    });
    const cosumer: Consumer = kafka.consumer({
      groupId: groupId || process.env.KAFKA_GROUP!,
    });
    this.consumers.push(cosumer);
    return cosumer;
  }
}
