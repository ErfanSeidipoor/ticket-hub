import { Injectable } from '@nestjs/common';
import { SigninRequestAuth } from '@tickethub/dto';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hello API (auth controller)' };
  }

  signin({email, password}:SigninRequestAuth): { message: string } {
    return { message: 'Hello API (auth controller - signin)' };
  }
}
