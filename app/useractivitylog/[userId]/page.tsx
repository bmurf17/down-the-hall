import ActivityLog from "@/components/shared/ActivityLog";
import { getUserActivityLogData } from "@/functions/getactivtyLog";
import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";

export default async function Page({ params }: { params: { userId: string } }) {
  const userActivityLog: UserActivityLogList = await getUserActivityLogData(
    params.userId
  );

  return (
    <div className="mx-16">
      <div className="rounded-xl bg-card p-3 animate-fade-in-grow">
        <ActivityLog activityLog={userActivityLog} />
      </div>
    </div>
  );
}
