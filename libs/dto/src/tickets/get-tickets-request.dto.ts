import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsMongoId } from 'class-validator';

export class GetTicketsRequestTickets {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsMongoId()
  ticketId?: string;
}
