import { getTrendingByMonth } from "@/actions/hardcoverActions";
import CentralDisplay from "@/components/CentralDisplay";
import { TrendingBookData } from "@/types/trendingbookresponse";

export default async function Home() {
  const trendingData: TrendingBookData = await getTrendingByMonth();

  return (
    <div className="mx-16 ">
      <CentralDisplay trendingData={trendingData} />
    </div>
  );
}
