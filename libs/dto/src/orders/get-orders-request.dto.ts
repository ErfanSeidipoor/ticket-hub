import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class GetOrdersRequestOrders {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;
}
