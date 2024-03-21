import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { PaginationService } from './pagination.service';
import { PaginationInterceptor } from './pagination.interceptor';

export function UsePagination(entity: string) {
  return applyDecorators(
    UseInterceptors(new PaginationInterceptor(new PaginationService(), entity)),
  );
}
