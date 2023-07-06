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
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Get('/health')
  healthCheck() {
    return '/api/orders 🚀🚀';
  }

  @Post()
  @UseGuards(Authenticated)
  create(@UserId() userId: string, @Body() body: CreateTicketRequestTickets) {
    return this.orderService.create(userId, body);
  }

  @Get('/:orderId')
  @UseGuards(Authenticated)
  getById(@Param('orderId', new ParseMongoIdPipe()) orderId: string) {
    return this.orderService.getById(orderId);
  }

  @Get()
  @UseGuards(Authenticated)
  get(@Query() query: GetTicketsRequestTickets) {
    return this.orderService.get(query);
  }

  @Put('/:orderId')
  @UseGuards(Authenticated)
  update(
    @UserId() userId: string,
    @Param('orderId', new ParseMongoIdPipe()) orderId: string,
    @Body() body: UpdateTicketRequestTickets
  ) {
    return this.orderService.update(userId, orderId, body);
  }
}
