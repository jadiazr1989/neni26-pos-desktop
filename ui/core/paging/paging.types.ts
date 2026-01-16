// src/core/paging/paging.types.ts
export type PageParams = {
  take: number;
  skip: number;
};

export type PageResult<T> = {
  items: T[];
  hasMore: boolean;
};
