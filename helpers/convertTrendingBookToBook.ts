import { SelectBook, SelectAuthor } from "@/lib/schema";
import {
  TrendingAuthorsData,
  TrendingAuthorsResponse,
} from "@/types/authorhardcoverresponse";
import { Book } from "@/types/book";
import {
  TrendingBookData,
  TrendingImage,
  TrendingImageData,
} from "@/types/trendingbookresponse";

export function convertTrendingBookData(
  trendingData: TrendingBookData,
  authorData: TrendingAuthorsData,
  imageData: TrendingImageData
): Book[] {
  return Object.values(trendingData).map((trendingBookDetails, index) => {
    const book: SelectBook = {
      id: trendingBookDetails.id,
      title: trendingBookDetails.dto_combined.title,
      authorId:
        trendingBookDetails.dto_combined.contributions[0]?.author_id || null,
      image: imageData.images.filter(
        (img) => img.id === trendingBookDetails.dto_combined.image_ids[0]
      )[0].url,
      status: null, // Set appropriate status based on your requirements
      releaseYear: trendingBookDetails.dto_combined.release_year,
      defaultPhysicalEditionId: null, // Set if applicable
      description: trendingBookDetails.dto_combined.description,
      seriesPosition:
        trendingBookDetails.dto_combined.series[0]?.position || null,
      seriesLength: trendingBookDetails.dto_combined.series.length || null,
      seriesName: trendingBookDetails.dto_combined.series[0]?.details || null,
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
