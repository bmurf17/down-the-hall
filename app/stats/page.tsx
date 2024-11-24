import Stats from "@/components/stats/Stats";
import { currentUser } from "@clerk/nextjs/server";

export default async function StatsPage() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return null;
  }

  const userRightNow = await currentUser();

  return (
    <div className="mx-16 ">
      <Stats currentUserId={userRightNow?.id || ""} />
    </div>
  );
}
