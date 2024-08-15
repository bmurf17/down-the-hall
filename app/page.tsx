import { fetchTrendingData, getSignedUrl } from "@/actions/hardcoverActions";
import CentralDisplay from "@/components/CentralDisplay";
import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { storage } from "@/lib/firebase-config";
import { TrendingData } from "@/types/trending/trendingbookresponse";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export default async function Home() {
  const trendingData: TrendingData = await fetchTrendingData();
  const convertedData = await convertTrendingBookData(
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
