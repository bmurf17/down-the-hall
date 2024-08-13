import fetchTrendingData from "@/actions/hardcoverActions";
import CentralDisplay from "@/components/CentralDisplay";
import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { TrendingData, TrendingBookData } from "@/types/trendingbookresponse";

export default async function Home() {
  const trendingData: TrendingData = await fetchTrendingData();
  const test = convertTrendingBookData(
    trendingData.bookData,
    trendingData.authorData,
    trendingData.imageData
  );

  return (
    <div className="mx-16 ">
      <CentralDisplay books={test} />
    </div>
  );
}
