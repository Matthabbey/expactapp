import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { Response, Request } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];

    if (authHeader) {
      const bearerIndex = authHeader.indexOf('Bearer');
      const token = authHeader.substring(bearerIndex + 7);

      try {
        verify(token, process.env.JWT_ACCESS_SECRET);
      } catch (error) {
        throw new BadRequestException();
      }

      next();
    } else {
      throw new NotFoundException();
    }
  }
}
