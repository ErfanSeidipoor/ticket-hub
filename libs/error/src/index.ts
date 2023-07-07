import { HttpException, HttpStatus } from '@nestjs/common';

export interface ICustomError {
  status: number;
  description: string;
}

export class CustomError extends HttpException {
  constructor({ description, status }: ICustomError) {
    super(description, status);
  }
}

export const TICKET_IS_ALREADY_RESERVED_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'Ticket Is Already Reserved!',
};

export const TICKET_NOT_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'Ticket Not Found!',
};

export const INVALID_EMAIL_OR_PASSWORD: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid Email or Password',
};

export const EMAIL_OR_PASSWORD_IS_INCORRECT: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Email OR Password is Incorrect',
};

export const EMAIL_ALREADY_EXISTS: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Email Already Exists',
};

export const ORDER_NOT_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'Order Not Found!',
};
