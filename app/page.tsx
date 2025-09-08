import { fetchTrendingData } from "@/actions/hardcoverActions";
import CentralDisplay from "@/components/home/CentralDisplay";
import { getUserActivityLogData } from "@/functions/getactivtyLog";
import { getCurrentUser } from "@/functions/getCurrentUser";
import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";
import { Book } from "@/types/book";
import { TrendingData } from "@/types/trending/trendingbookresponse";
import { UserActivityLog } from "@/types/userActivityLog";
import { currentUser } from "@clerk/nextjs/server";

export interface UserActivityLogReturnType {
  user_activity_log: UserActivityLog;
  book: Book;
}

// Default empty data structures for fallbacks
const DEFAULT_TRENDING_DATA: Book[] = [];
const DEFAULT_USER_ACTIVITY_LOG: UserActivityLogList = [];

async function fetchTrendingDataSafely(): Promise<Book[]> {
  try {
    const trendingData: TrendingData = await fetchTrendingData();

    if (!trendingData || !trendingData.bookData) {
      return DEFAULT_TRENDING_DATA;
    }

    const convertedData = await convertTrendingBookData(
      trendingData.bookData,
      trendingData.seriesData
    );

    return convertedData;
  } catch (error) {
    return DEFAULT_TRENDING_DATA;
  }
}

async function fetchUserActivityLogSafely(
  userId?: string
): Promise<UserActivityLogList> {
  try {
    if (!userId) {
      return DEFAULT_USER_ACTIVITY_LOG;
    }

    const userActivityLog = await getUserActivityLogData(userId);
    return userActivityLog || DEFAULT_USER_ACTIVITY_LOG;
  } catch (error) {
    return DEFAULT_USER_ACTIVITY_LOG;
  }
}

async function fetchUserGoalsSafely(userId: string, apiUrl: string) {
  try {
    const response = await fetch(`${apiUrl}/api/goals/${userId}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Goals API returned ${response.status}`);
    }

    const data = await response.json();
    return {
      books: data.books || [],
      goals: data.goals || [],
    };
  } catch (error) {
    return {
      books: [],
      goals: [],
    };
  }
}

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error("NEXT_PUBLIC_API_URL is not configured");
    return (
      <div className="mx-16">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Configuration Error</h2>
          <p className="text-muted-foreground">
            API URL is not configured. Please check your environment variables.
          </p>
        </div>
      </div>
    );
  }

  const userRightNow = await currentUser();

  const [convertedTrendingData, userActivityLog, userReading, userGoalsData] =
    await Promise.allSettled([
      fetchTrendingDataSafely(),
      fetchUserActivityLogSafely(userRightNow?.id),
      getCurrentUser(userRightNow?.id).catch((error) => {
        return undefined;
      }),
      userRightNow
        ? fetchUserGoalsSafely(userRightNow.id, process.env.NEXT_PUBLIC_API_URL)
        : Promise.resolve({ books: [], goals: [] }),
    ]);

  const trendingBooks =
    convertedTrendingData.status === "fulfilled"
      ? convertedTrendingData.value
      : DEFAULT_TRENDING_DATA;

  const activityLog =
    userActivityLog.status === "fulfilled"
      ? userActivityLog.value
      : DEFAULT_USER_ACTIVITY_LOG;

  const currentlyReading =
    userReading.status === "fulfilled" ? userReading.value : undefined;

  const goalsData =
    userGoalsData.status === "fulfilled"
      ? userGoalsData.value
      : { books: [], goals: [] };

  if (convertedTrendingData.status === "rejected") {
    console.error("Trending data fetch failed:", convertedTrendingData.reason);
  }
  if (userActivityLog.status === "rejected") {
    console.error("User activity log fetch failed:", userActivityLog.reason);
  }
  if (userReading.status === "rejected") {
    console.error("Current reading fetch failed:", userReading.reason);
  }
  if (userGoalsData.status === "rejected") {
    console.error("User goals fetch failed:", userGoalsData.reason);
  }

  return (
    <div className="mx-16">
      <CentralDisplay
        books={trendingBooks}
        userActivityLog={activityLog}
        currentlyReading={currentlyReading}
        goals={goalsData.goals}
        completedBooksLength={goalsData.books.length}
      />
    </div>
  );
}
