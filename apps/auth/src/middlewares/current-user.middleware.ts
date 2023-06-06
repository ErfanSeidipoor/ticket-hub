import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Jwt } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: { id: string; email: string };
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  async use(request: Request, response: Response, next: NextFunction) {
    if (!request.cookies || !request.cookies['jwt']) {
      request.currentUser = undefined;
    } else {
      try {
        request.cookies['jwt'];
        const verified = Jwt.verify(request.cookies['jwt']);
        request.currentUser = {
          id: verified.id,
          email: verified.email,
        };
      } catch (error) {
        response.clearCookie('jwt');
      }
    }
    next();
  }
}
