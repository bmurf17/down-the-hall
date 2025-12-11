import { fetchTrendingData } from "@/actions/hardcoverActions";
import CentralDisplay from "@/components/home/CentralDisplay";
import { getUserActivityLogData } from "@/functions/getactivtyLog";
import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";
import { Book } from "@/types/book";
import { TrendingData } from "@/types/trending/trendingbookresponse";
import { UserActivityLog } from "@/types/userActivityLog";
import { currentUser } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { users, book, userGoals } from "@/lib/schema";
import { Status } from "@/types/enums/statusEnum";
import { eq, and, sql } from "drizzle-orm";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

// Direct DB query for currently reading books
async function getCurrentUserReading(userId?: string) {
  try {
    if (!userId) {
      return undefined;
    }

    const data = await db
      .select({
        user: {
          id: users.id,
          userName: users.userName,
          image: users.image,
          lastLoggedIn: users.lastLoggedIn,
        },
        books: {
          id: book.id,
          title: book.title,
          image: book.image,
          dateRead: book.dateRead,
          rating: book.rating,
        },
      })
      .from(users)
      .where(eq(users.id, userId))
      .leftJoin(
        book,
        and(eq(book.userId, users.id), eq(book.status, Status.InProgress))
      );

    if (data.length === 0) {
      return undefined;
    }

    return {
      user: data[0].user,
      books: data.filter((row) => row.books?.id).map((row) => row.books),
    };
  } catch (error) {
    console.error("Current reading fetch failed:", error);
    return undefined;
  }
}

// Direct DB query for user goals
async function fetchUserGoalsSafely(userId?: string) {
  try {
    if (!userId) {
      return { books: [], goals: [] };
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const booksData = await db
      .select({
        bookId: book.id,
        title: book.title,
        dateRead: book.dateRead,
        pageCount: book.pageCount,
        image: book.image,
      })
      .from(book)
      .where(
        sql`${book.userId} = ${userId}
          AND ${book.dateRead} >= ${startOfYear}
          AND ${book.dateRead} IS NOT NULL
          AND ${book.status} = ${Status.Finished}`
      )
      .orderBy(book.dateRead);

    const goalsData = await db
      .select({
        id: userGoals.id,
        timeFrame: userGoals.timeFrame,
        bookCount: userGoals.bookCount,
      })
      .from(userGoals)
      .where(eq(userGoals.userId, userId));

    return {
      books: booksData,
      goals: goalsData,
    };
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
      getCurrentUserReading(userRightNow?.id),
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
    <div className="mx-16">
      <CentralDisplay
        books={trendingBooks}
        userActivityLog={activityLog}
        //@ts-ignore
        currentlyReading={currentlyReading}
        //@ts-ignore
        goals={goalsData.goals}
        completedBooksLength={goalsData.books.length}
      />
    </div>
  );
}