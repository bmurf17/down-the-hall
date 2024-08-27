import { fetchTrendingData } from "@/actions/hardcoverActions";
import CentralDisplay from "@/components/home/CentralDisplay";
import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { userActivityLog } from "@/lib/schema";
import { Book } from "@/types/book";
import { TrendingData } from "@/types/trending/trendingbookresponse";
import { UserActivityLog } from "@/types/userActivityLog";

export interface UserActivityLogReturnType {
  user_activity_log: UserActivityLog;
  book: Book;
}

async function getUserActivityLogData(userId?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/useractivitylog?userId=${userId}`, {
    next: { tags: ["userActivityLog"] },
  });
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return null;
  }

  const trendingData: TrendingData = await fetchTrendingData();
  const convertedData = await convertTrendingBookData(
    trendingData.bookData,
    trendingData.authorData,
    trendingData.imageData,
    trendingData.seriesData
  );
  const userActivityLog: any = await getUserActivityLogData("1");
  return (
    <div className="mx-16 ">
      <CentralDisplay books={convertedData} userActivityLog={userActivityLog} />
    </div>
  );
}
