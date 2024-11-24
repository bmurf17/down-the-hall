export interface MonthlyBookStats {
  month: string;
  totalPages: string;
  bookCount: string;
}

export type BookStatsResponse = MonthlyBookStats[];
