import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserId } from '@tickethub/decorator';
import {
  CreateOrderRequestOrders,
  GetOrdersRequestOrders,
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
  create(@UserId() userId: string, @Body() body: CreateOrderRequestOrders) {
    return this.orderService.create(userId, body);
  }

  @Get('/:orderId')
  @UseGuards(Authenticated)
  getById(
    @UserId() userId: string,
    @Param('orderId', new ParseMongoIdPipe()) orderId: string
  ) {
    return this.orderService.getById(userId, orderId);
  }

  @Get()
  @UseGuards(Authenticated)
  get(@UserId() userId: string, @Query() query: GetOrdersRequestOrders) {
    return this.orderService.get(userId, query);
  }

  @Delete('/:orderId')
  @UseGuards(Authenticated)
  cancel(
    @UserId() userId: string,
    @Param('orderId', new ParseMongoIdPipe()) orderId: string
  ) {
    return this.orderService.cancel(userId, orderId);
  }
}
