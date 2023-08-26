import { Process, Processor } from '@nestjs/bull';
import { QUEUE_NAME } from './constants';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor(QUEUE_NAME)
export class Consumer {
  private readonly logger = new Logger(Consumer.name);

  @Process()
  async process(job: Job<{ filename: string }>) {
    this.logger.log(job.data);
  }
}
