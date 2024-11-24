import Stats from "@/components/stats/Stats";
import { BookStatsResponse } from "@/types/stats/monthlyBooksStats";
import { currentUser } from "@clerk/nextjs/server";

async function getMonthlyPageData(): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const userRightNow = await currentUser();
  const res = await fetch(`${baseUrl}/api/stats/${userRightNow?.id}`, {
    next: { tags: ["stats" + userRightNow?.id] },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function StatsPage() {
  const data: BookStatsResponse = await getMonthlyPageData();

  const userRightNow = await currentUser();

  return (
    <div className="mx-16 ">
      <Stats currentUserId={userRightNow?.id || ""} />
    </div>
  );
}
