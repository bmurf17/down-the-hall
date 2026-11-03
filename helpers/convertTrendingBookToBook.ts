import "server-only";

import { handleImage } from "@/lib/supabase-storage";
import { buildTrendingBook } from "@/lib/books/convert-trending";
import { Book } from "@/types/book";
import { SeriesListResponse } from "@/types/trending/seriesHardCoverResponse";
import {
  TrendingBookData,
  TrendingBookDetails,
} from "@/types/trending/trendingbookresponse";

export async function convertTrendingBookData(
  trendingData: TrendingBookData,
  seriesData: SeriesListResponse
): Promise<Book[]> {
  return await Promise.all(
    trendingData.books.map((trendingBookDetails) =>
      processTrendingBookDetails(trendingBookDetails, seriesData)
    )
  );
}

export const processTrendingBookDetails = async (
  trendingBookDetails: TrendingBookDetails,
  seriesData: SeriesListResponse
): Promise<Book> => {
  const image = await handleImage(
    trendingBookDetails.id,
    trendingBookDetails.title,
    trendingBookDetails.cached_image?.url || ""
  );

  return buildTrendingBook(trendingBookDetails, seriesData, image);
};
