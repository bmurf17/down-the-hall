import ActivityLog from "@/components/shared/ActivityLog";
import { desc, eq } from "drizzle-orm";
import db from "@/lib/db";
import { author, book, userActivityLog } from "@/lib/schema";
import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";

// Infer the type from the actual query result
type UserActivityLogData = Awaited<ReturnType<typeof getUserActivityLogData>>;

export async function getUserActivityLogData(userId: string | undefined) {
  if (!userId) {
    return [];
  }

  const data = await db
    .select({
      userActivity: userActivityLog,
      bookDetails: book,
      authorDetails: author,
    })
    .from(userActivityLog)
    .innerJoin(book, eq(userActivityLog.bookId, book.id))
    .leftJoin(author, eq(book.authorId, author.id))
    .where(eq(userActivityLog.userId, userId))
    .orderBy(desc(userActivityLog.updatedDate));

  return data;
}

export default async function Page({ params }: { params: { userId: string } }) {
  //@ts-ignore
  const userActivityLog:UserActivityLogList = await getUserActivityLogData(params.userId);

  return (
    <div className="mx-16">
      <div className="rounded-xl bg-card p-3 animate-fade-in-grow">
        <ActivityLog activityLog={userActivityLog} />
      </div>
    </div>
  );
}