import { getTrendingByMonth } from "@/actions/hardcoverActions";
import CentralDisplay from "@/components/CentralDisplay";
import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { TrendingData, TrendingBookData } from "@/types/trendingbookresponse";

export default async function Home() {
  const trendingData: TrendingData = await getTrendingByMonth();

  const test = convertTrendingBookData(
    trendingData.bookData,
    trendingData.authorData,
    trendingData.imageData
  );

  // console.log(test);

  return (
    <div className="mx-16 ">
      <CentralDisplay books={test} />
    </div>
  );
}
