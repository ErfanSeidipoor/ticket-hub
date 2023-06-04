import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const UserId = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest() as Request;
    return (request.currentUser && request.currentUser.id) || null;
  }
);

export const Email = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest() as Request;
    return (request.currentUser && request.currentUser.email) || null;
  }
);
