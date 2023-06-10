import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserId } from '@tickethub/decorator';
import {
  CreateTicketRequestTickets,
  GetTicketsRequestTickets,
  UpdateTicketRequestTickets,
} from '@tickethub/dto';
import { Authenticated } from '@tickethub/guard';
import { ParseMongoIdPipe } from '@tickethub/pipe';
import { TicketsService } from './tickets.service';

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

  @Get()
  @UseGuards(Authenticated)
  get(@Query() query: GetTicketsRequestTickets) {
    return this.ticketService.get(query);
  }

  @Put('/:ticketId')
  @UseGuards(Authenticated)
  update(
    @UserId() userId: string,
    @Param('ticketId', new ParseMongoIdPipe()) ticketId: string,
    @Body() body: UpdateTicketRequestTickets
  ) {
    return this.ticketService.update(userId, ticketId, body);
  }
}
