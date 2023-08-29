import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserId } from '@tickethub/decorator';
import { CreatePaymentRequestPayments } from '@tickethub/dto';
import { Authenticated } from '@tickethub/guard';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('/health')
  healthCheck() {
    return '/api/payments 🚀🚀';
  }

  @Post()
  @UseGuards(Authenticated)
  create(@UserId() userId: string, @Body() body: CreatePaymentRequestPayments) {
    return this.paymentsService.createPayment(userId, body);
  }
}
