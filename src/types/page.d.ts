interface Page<T> {
  docs: T[];
  total: number;
  limit: number;
  page: number;
  pages: number;
  sort: string;
}