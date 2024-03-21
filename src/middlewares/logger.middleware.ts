import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly userService: UsersService) {}
  private logger = new Logger('HTTP');
  async use(request: Request, response: Response, next: NextFunction) {
    const { ip, method, originalUrl, headers } = request;
    const userAgent = request.get('user-agent') || '';
    const send = response.send;
    response.send = (exitData) => {
      if (
        response
          ?.getHeader('content-type')
          ?.toString()
          .includes('application/json')
      ) {
        const statusCode = exitData?.code || response.statusCode;
        console.log({
          code: statusCode,
          // exit: jsonData.data.access_token,
          endDate: new Date(),
        });
        this.logger.log(
          `-${method} -${originalUrl} -${statusCode} -${headers.referer} -${userAgent} -${ip} -${request.socket.remoteAddress}`,
        );
      }
      response.send = send;
      return response?.send(exitData);
    };
    next();
  }
}
