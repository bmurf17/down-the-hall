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

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return null;
  }

  const trendingData: TrendingData = await fetchTrendingData();
  const convertedData = await convertTrendingBookData(
    trendingData.bookData,
    trendingData.seriesData
  );

  const userRightNow = await currentUser();

  const userActivityLog: UserActivityLogList = await getUserActivityLogData(
    userRightNow?.id
  );

  var userReading;
  try {
    userReading = await getCurrentUser(userRightNow?.id);
  } catch (ex) {
    console.log("user probably not logged in");
  }

  var userGoals;
  var completedBooks = [];
  try {
    if (userRightNow) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/goals/${userRightNow.id}`
      );

      const { books, goals } = await response.json();

      completedBooks = books;
      userGoals = goals;
    }
  } catch (ex) {
    console.log("user probably not logged in");
  }

  return (
    <div className="mx-16">
      <CentralDisplay
        books={convertedData}
        userActivityLog={userActivityLog}
        currentlyReading={userReading}
        goals={userGoals}
        completedBooksLength={completedBooks.length}
      />
    </div>
  );
}
