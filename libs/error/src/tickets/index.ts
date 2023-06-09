import { HttpStatus } from '@nestjs/common';
import { ICustomError } from '..';

export const TICKET_NOT_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'Ticket Not Found!',
};
