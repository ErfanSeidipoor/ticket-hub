import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { SigninRequestAuth, SignupRequestAuth } from '@tickethub/dto';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserId } from '@tickethub/decorator';
import { Authenticated } from '@tickethub/guard';

@Controller()
export class AuthController {
  constructor(private readonly appService: AuthService) {}

  @Get()
  healthCheck() {
    return '/api/auth 🚀🚀';
  }

  @Get('/current-user')
  @UseGuards(Authenticated)
  getCurrentUser(@UserId() userId: string) {
    return this.appService.currentUser(userId);
  }

  @Post('/signin')
  singin(
    @Res({ passthrough: true }) response: Response,
    @Body() body: SigninRequestAuth
  ) {
    return this.appService.signin(response, body);
  }

  @Get('/signout')
  signout(@Res({ passthrough: true }) response: Response) {
    return this.appService.signout(response);
  }

  @Post('/signup')
  signup(
    @Res({ passthrough: true }) response: Response,
    @Body() body: SignupRequestAuth
  ) {
    return this.appService.signup(response, body);
  }
}
