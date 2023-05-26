import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://tckhb-auth-mongo-clusterip-service:27017/auth',{ })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
