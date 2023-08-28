import { INestApplication } from '@nestjs/common';
import { BullService } from '../app/bull/bull.service';

export class HelperBull {
  bullService: BullService;

  constructor(public app: INestApplication) {
    this.bullService = app.get<BullService>(BullService);
  }

  async emptyJobs() {
    await this.bullService.queue.empty();
  }
}
