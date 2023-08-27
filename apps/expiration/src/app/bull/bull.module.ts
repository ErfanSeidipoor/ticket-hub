import { BullModule as Bull } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_NAME } from '.';
import { Consumer } from './consumer';
import { KafkaModule } from '../kafka/kafka.module';
import { BullService } from './bull.service';

@Module({
  imports: [
    KafkaModule,
    Bull.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_URL'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    Bull.registerQueue({
      name: QUEUE_NAME,
    }),
  ],
  providers: [Consumer, BullService],
  exports: [BullService],
})
export class BullModule {}
