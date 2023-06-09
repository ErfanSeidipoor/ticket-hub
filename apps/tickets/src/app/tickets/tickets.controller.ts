import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  CreateTicketRequestTickets,
  SigninRequestAuth,
  SignupRequestAuth,
} from '@tickethub/dto';
import { Response } from 'express';
import { TicketsService } from './tickets.service';
import { UserId } from '@tickethub/decorator';
import { Authenticated } from '@tickethub/guard';
import { ParseMongoIdPipe } from '@tickethub/pipe';

@Controller()
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Get('/health')
  healthCheck() {
    return '/api/tickets 🚀🚀';
  }

  @Post()
  @UseGuards(Authenticated)
  create(@UserId() userId: string, @Body() body: CreateTicketRequestTickets) {
    return this.ticketService.create(userId, body);
  }

  @Get('/:ticketId')
  @UseGuards(Authenticated)
  getById(@Param('ticketId', new ParseMongoIdPipe()) ticketId: string) {
    return this.ticketService.getById(ticketId);
  }

  // @Get('/current-user')
  // @UseGuards(Authenticated)
  // getCurrentUser(@UserId() userId: string) {
  //   return this.ticketService.currentUser(userId);
  // }

  // @Post('/signin')
  // singin(
  //   @Res({ passthrough: true }) response: Response,
  //   @Body() body: SigninRequestAuth
  // ) {
  //   return this.ticketService.signin(response, body);
  // }

  // @Get('/signout')
  // signout(@Res({ passthrough: true }) response: Response) {
  //   return this.ticketService.signout(response);
  // }

  // @Post('/signup')
  // signup(
  //   @Res({ passthrough: true }) response: Response,
  //   @Body() body: SignupRequestAuth
  // ) {
  //   return this.ticketService.signup(response, body);
  // }
}
