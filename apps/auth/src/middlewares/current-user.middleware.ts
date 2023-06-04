import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtToken {
  id: string;
  email: string;
}

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
    if (!request.cookies['jwt']) {
      request.currentUser = undefined;
    } else {
      try {
        const verify = jwt.verify(
          request.cookies['jwt'],
          process.env['JWT_KEY']
        ) as JwtToken;
        request.currentUser = {
          id: verify.id,
          email: verify.email,
        };
      } catch (error) {
        response.clearCookie('jwt');
      }
    }
    next();
  }
}
