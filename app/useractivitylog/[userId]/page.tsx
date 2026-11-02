import ActivityLog from "@/components/shared/ActivityLog";
import { getUserActivityLog } from "@/lib/queries/books";
import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";

export default async function Page({ params }: { params: { userId: string } }) {
  const userActivityLog = (await getUserActivityLog(
    params.userId
  )) as UserActivityLogList;

  return (
    <div className="mx-16">
      <div className="rounded-xl bg-card p-3 animate-fade-in-grow">
        <ActivityLog activityLog={userActivityLog} />
      </div>
    </div>
  );
}
