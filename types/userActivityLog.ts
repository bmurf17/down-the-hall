import { SelectBook, SelectUserActivityLog } from "@/lib/schema";

export interface UserActivityLog {
  userActiivityLog: SelectUserActivityLog;
  book: SelectBook;
}
