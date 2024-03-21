import { Injectable } from '@nestjs/common';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from './pagination.constants';

@Injectable()
export class PaginationService {
  applyPagination(data: Array<any>, page: number, pageSize: number): Array<any> {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    return data.slice(offset, offset + limit);
  }

  getPage(page?: number): number {
    return page && page > 0 ? page : DEFAULT_PAGE_NUMBER;
  }

  getPageSize(pageSize?: number): number {
    return pageSize && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  }
}
