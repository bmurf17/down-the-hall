import { SelectBook, SelectAuthor } from "@/lib/schema";
import {
  TrendingAuthorsData,
  TrendingAuthorsResponse,
} from "@/types/trending/authorhardcoverresponse";
import { Book } from "@/types/book";
import {
  TrendingBookData,
  TrendingImageData,
} from "@/types/trending/trendingbookresponse";
import { SeriesListResponse } from "@/types/trending/seriesHardCoverResponse";

export function convertTrendingBookData(
  trendingData: TrendingBookData,
  authorData: TrendingAuthorsData,
  imageData: TrendingImageData,
  seriesData: SeriesListResponse
): Book[] {
  return Object.values(trendingData).map((trendingBookDetails, index) => {
    var series = seriesData?.series.filter(
      (series) =>
        series.id === trendingBookDetails.dto_combined.series[0]?.series_id
    );

    const book: SelectBook = {
      id: trendingBookDetails.id,
      title: trendingBookDetails.dto_combined.title,
      authorId:
        trendingBookDetails.dto_combined.contributions[0]?.author_id || null,
      image: imageData.images.filter(
        (img) => img.id === trendingBookDetails.dto_combined.image_ids[0]
      )[0].url,
      status: null,
      releaseYear: trendingBookDetails.dto_combined.release_year,
      defaultPhysicalEditionId: trendingBookDetails.default_physical_edition_id, // Set if applicable
      description: trendingBookDetails.dto_combined.description,
      seriesPosition:
        trendingBookDetails.dto_combined.series[0]?.position || null,
      seriesLength: trendingBookDetails.dto_combined.series.length || null,
      seriesName: series.length > 0 ? series[0].name : "",
      hardcoverId: trendingBookDetails.id,
      pageCount: trendingBookDetails.dto_combined.page_count,
      genres: trendingBookDetails.dto_combined.genres,
    };

    const author: SelectAuthor = {
      id: trendingBookDetails.dto_combined.contributions[0].author_id,
      name: authorData.authors.filter(
        (au) =>
          au.id === trendingBookDetails.dto_combined.contributions[0]?.author_id
      )[0].name,
      image: "",
    };

    return { book, author };
  });
}
