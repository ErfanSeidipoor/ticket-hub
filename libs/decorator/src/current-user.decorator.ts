import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: { id: string; email: string };
    }
  }
}

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
