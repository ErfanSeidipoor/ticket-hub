import { OnQueueError, Process, Processor } from '@nestjs/bull';
import { IJob, QUEUE_NAME } from '.';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { OrderExpirationProducer } from '@tickethub/event';

@Processor(QUEUE_NAME)
export class Consumer {
  constructor(private readonly kafkaService: KafkaService) {}
  private readonly logger = new Logger(Consumer.name);

  @OnQueueError()
  handler(error) {
    console.log({ error });
  }

  @Process()
  async process(job: Job<IJob>) {
    await new OrderExpirationProducer(this.kafkaService.producer).produce({
      id: job.data.orderId,
    });
  }
}
