import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DBService } from './db.service';
import { models } from '@tickethub/payments/models';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL),
    MongooseModule.forFeature(models),
  ],
  providers: [DBService],
  exports: [DBService],
})
export class DBModule {}
