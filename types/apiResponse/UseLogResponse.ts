import { SelectAuthor, SelectBook, SelectUserActivityLog } from "@/lib/schema";

type UserActivityLog = {
  userActivity: SelectUserActivityLog;
  bookDetails: SelectBook;
  authorDetails: SelectAuthor | null;
};

export type UserActivityLogList = UserActivityLog[];
