import { HttpException } from '@nestjs/common';

export interface ICustomError {
  status: number;
  description: string;
}

export class CustomError extends HttpException {
  constructor({ description, status }: ICustomError) {
    super(description, status);
  }
}

export * from './auth';
export * from './tickets';
