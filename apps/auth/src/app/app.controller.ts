import { Body, Controller, Get, Post } from '@nestjs/common';

import { AppService } from './app.service';
import { SigninRequestAuth } from '@tickethub/dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get("/current-user")
  getCurrentUser() {
    return this.appService.getData();
  }

  @Post("/signin")
  singin( @Body() body: SigninRequestAuth) {
    return this.appService.signin(body);
  }

  @Post("/signout")
  signout() {
    return this.appService.getData();
  }

  @Post("/signup")
  signup() {
    return this.appService.getData();
  }
}
