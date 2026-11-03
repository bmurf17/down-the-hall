import PageShell from "@/components/shared/Page";
import { fetchTrendingData } from "@/actions/hardcoverActions";
import CentralDisplay from "@/components/home/CentralDisplay";
import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";
import { Book } from "@/types/book";
import { TrendingData } from "@/types/trending/trendingbookresponse";
import { currentUser } from "@clerk/nextjs/server";
import { getUserActivityLog } from "@/lib/queries/books";
import { getUserGoals } from "@/lib/queries/goals";
import { getUserWithCurrentlyReading } from "@/lib/queries/users";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    const userActivityLog = await getUserActivityLog(userId);
    return (
      (userActivityLog as UserActivityLogList) || DEFAULT_USER_ACTIVITY_LOG
    );
  } catch (error) {
    return DEFAULT_USER_ACTIVITY_LOG;
  }
}

async function fetchUserGoalsSafely(userId?: string) {
  try {
    if (!userId) {
      return { books: [], goals: [] };
    }

    return await getUserGoals(userId);
  } catch (error) {
    console.error("User goals fetch failed:", error);
    return {
      books: [],
      goals: [],
    };
  }
}

export default async function Home() {
  const userRightNow = await currentUser();

  const [convertedTrendingData, userActivityLog, userReading, userGoalsData] =
    await Promise.allSettled([
      fetchTrendingDataSafely(),
      fetchUserActivityLogSafely(userRightNow?.id),
      getUserWithCurrentlyReading(userRightNow?.id ?? "").catch(
        () => undefined
      ),
      fetchUserGoalsSafely(userRightNow?.id),
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
    <PageShell>
      <CentralDisplay
        books={trendingBooks}
        userActivityLog={activityLog}
        currentlyReading={currentlyReading}
        goals={goalsData.goals}
        completedBooksLength={goalsData.books.length}
      />
    </PageShell>
  );
}
