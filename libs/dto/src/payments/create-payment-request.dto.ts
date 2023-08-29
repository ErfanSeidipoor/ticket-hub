import { IsMongoId, IsString } from 'class-validator';

export class CreatePaymentRequestPayments {
  @IsMongoId()
  orderId?: string;

  @IsString()
  token: string;
}
