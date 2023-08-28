import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JobOptions, Queue } from 'bull';
import { IJob, QUEUE_NAME } from '.';

@Injectable()
export class BullService {
  constructor(
    @InjectQueue(QUEUE_NAME)
    public readonly queue: Queue<IJob>
  ) {}
}
