import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateTicketRequestTickets {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @IsPositive()
  @IsNumber()
  price: number;
}
