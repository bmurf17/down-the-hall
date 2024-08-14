import fetchTrendingData from "@/actions/hardcoverActions";
import CentralDisplay from "@/components/CentralDisplay";
import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { TrendingData } from "@/types/trending/trendingbookresponse";

export default async function Home() {
  const trendingData: TrendingData = await fetchTrendingData();
  const convertedData = convertTrendingBookData(
    trendingData.bookData,
    trendingData.authorData,
    trendingData.imageData,
    trendingData.seriesData
  );

  return (
    <div className="mx-16 ">
      <CentralDisplay books={convertedData} />
    </div>
  );
}
