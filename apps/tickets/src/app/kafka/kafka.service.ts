import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import {
  Admin,
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
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

  public readonly requiredTopics = ['tickets-create-ticket'];

  public readonly admin: Admin = this.kafka.admin();

  private readonly consumers: Consumer[] = [];

  private readonly producer: Producer = this.kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  async onModuleInit() {
    const describeGroups = await this.admin.describeGroups([
      process.env.KAFKA_GROUP,
      'grounp-test',
    ]);
    console.log({ describeGroups });
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

  async consume(
    topics: ConsumerSubscribeTopics,
    config: ConsumerRunConfig,
    groupId?: string
  ) {
    const groupId_ = groupId || process.env.KAFKA_GROUP!;
    console.log({ groupId_ });
    const cosumer: Consumer = this.kafka.consumer({
      groupId: groupId_,
    });
    await cosumer.connect();
    await cosumer.subscribe(topics);
    await cosumer.run(config);
    this.consumers.push(cosumer);
  }
}
