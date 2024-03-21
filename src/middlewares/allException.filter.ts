import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';

@Catch(HttpException)
export class AllExceptionsFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const res: Response = ctx.getResponse<Response>();

    const statusCode: number =
      exception && !Number.isNaN(exception.getStatus())
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = (exception.getResponse() as { message: string }).message;

    const responseBody = {
      message,
      error: (exception.getResponse() as { error: string })?.error,
      statusCode,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      timestamp: new Date().toISOString(),
    };
    httpAdapter.reply(res, responseBody, httpStatus);
  }
}
