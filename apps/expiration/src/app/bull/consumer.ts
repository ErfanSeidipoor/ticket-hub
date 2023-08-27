import { OnQueueError, Process, Processor } from '@nestjs/bull';
import { IJob, QUEUE_NAME } from '.';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor(QUEUE_NAME)
export class Consumer {
  private readonly logger = new Logger(Consumer.name);

  @OnQueueError()
  handler(error) {
    console.log('fired exception', { error });
  }

  @Process()
  async process(job: Job<IJob>) {
    console.log({ job });
    this.logger.log('bull consumer', job.data);
  }
}
