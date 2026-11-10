import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";
import { BookCover } from "./BookCover";

interface Props {
  activityLog: UserActivityLogList;
}

export default function ActivityLog({ activityLog }: Props) {
  if (activityLog.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No activity yet. Add a book to get started.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {activityLog.map((data, index) => {
        const book = data.bookDetails;
        return (
          <li key={data.userActivity.id ?? index} className="flex gap-3 py-3">
            <BookCover src={book?.image} className="w-12 shrink-0 sm:w-14" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {data.userActivity.action}
              </p>
              <p className="line-clamp-2 text-base font-semibold leading-snug">{book?.title}</p>
              <p className="text-sm text-muted-foreground">{data.authorDetails?.name}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}