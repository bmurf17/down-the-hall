import "server-only";

import { handleImage } from "@/lib/supabase-storage";
import { SelectAuthor, SelectBook } from "@/lib/schema";
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
  const series = seriesData?.series?.filter((series) => {
    if (trendingBookDetails?.book_series?.length > 0) {
      return series.id === trendingBookDetails.book_series[0]?.series_id;
    }
  });

  const image = await handleImage(
    trendingBookDetails.id,
    trendingBookDetails.title,
    trendingBookDetails.cached_image?.url || ""
  );

  const genres = Array.from(
    new Set([
      ...(trendingBookDetails.genres ?? []),
      ...(trendingBookDetails.cached_tags?.Genre?.map((tag) => tag.tag) ?? []),
    ])
  );

  const book: SelectBook = {
    id: 0,
    title: trendingBookDetails.title,
    authorId:
      trendingBookDetails.contributions?.length > 0
        ? trendingBookDetails.contributions[0]?.author_id || null
        : 0,
    image: image,
    status: null,
    releaseYear: trendingBookDetails.release_year,
    defaultPhysicalEditionId: trendingBookDetails.default_physical_edition_id,
    description: trendingBookDetails.description,
    seriesPosition:
      trendingBookDetails.book_series?.length > 0
        ? trendingBookDetails.book_series[0]?.position?.toString() || null
        : null,
    seriesLength: trendingBookDetails.book_series?.length
      ? trendingBookDetails.book_series.length || null
      : null,
    seriesName: series?.length > 0 ? series[0].name : "",
    hardcoverId: trendingBookDetails.id,
    pageCount: trendingBookDetails.pages,
    genres: genres,
    dateRead: Date.now().toString(),
    updatedDate: Date.now().toString(),
    userId: "",
    rating: "0",
  };

  const author: SelectAuthor = {
    id:
      trendingBookDetails.contributions?.length > 0
        ? trendingBookDetails.contributions[0].author_id
        : 0,
    name:
      trendingBookDetails.cached_contributors?.length > 0
        ? trendingBookDetails.cached_contributors[0].author.name
        : "",
    image: "",
  };

  const returnBook: Book = {
    author: author,
    book: book,
    book_notes: null,
  };

  return returnBook;
};
