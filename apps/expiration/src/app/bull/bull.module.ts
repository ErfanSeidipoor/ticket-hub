import { BullModule as Bull } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_NAME } from './constants';
import { Consumer } from './consumer';

@Module({
  imports: [
    Bull.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    Bull.registerQueue({
      name: QUEUE_NAME,
    }),
  ],
  providers: [Consumer],
})
export class BullModule {}
