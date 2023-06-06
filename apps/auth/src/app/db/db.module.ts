import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DBService } from './db.service';
import { User, UserSchema } from '@tickethub/auth/models';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://tckhb-auth-mongo-clusterip-service:27017/auth'
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [DBService],
  exports: [DBService],
})
export class DBModule {}
