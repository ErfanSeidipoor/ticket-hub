import { IsMongoId } from 'class-validator';

export class CreateOrderRequestOrders {
  @IsMongoId()
  ticketId?: string;
}
