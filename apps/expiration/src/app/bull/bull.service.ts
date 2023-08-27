import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JobOptions, Queue } from 'bull';
import { IJob, QUEUE_NAME } from '.';

@Injectable()
export class BullService {
  constructor(
    @InjectQueue(QUEUE_NAME)
    private readonly queue: Queue<IJob>
  ) {}

  async add(job: IJob, jobOptions?: JobOptions) {
    await this.queue.add(job, jobOptions);

    console.log('job added to redis queue');
  }
}
