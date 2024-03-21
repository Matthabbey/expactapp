import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class ResponseWithDataInterceptor implements NestInterceptor {
  // constructor(private readonly defaultMessage: string = 'You are not authorized to access this endpoint') {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Logic before the request is handled by the route handler
    console.log('Before...');
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;
    //const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        // Logic after the request is handled by the route handler
        console.log('After...');

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (data instanceof HttpException) {
          status = data.getStatus();
          console.log(status);
        }
        // const statusCode = data && data.message ? data.message : 'You are not authorized to access this endpoint';
        // Check if the response is successful (status code 2xx)
        if (data.statusCode >= 200 && data.statusCode < 300) {
          const message =
            data && data.message
              ? data.message
              : 'You are not authorized to access this endpoint';
          // Transform the successful response to your custom format
          return new SuccessfulResponse(message, statusCode, data.data);
        }
        // Transform the response to your custom format
        return data.response;
      }),
    );
  }
}

export class SuccessfulResponse {
  private message: string;
  private statusCode: number;
  private data: any;

  constructor(message: string, statusCode: number, data: any) {
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }

  getSuccessMessage() {
    return this.message;
  }

  getStatusCode() {
    return this.statusCode;
  }
  getData() {
    return this.data;
  }
}
