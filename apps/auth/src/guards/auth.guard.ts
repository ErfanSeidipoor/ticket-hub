import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class Authenticated implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as Request;
    return !!request.currentUser;
  }
}
