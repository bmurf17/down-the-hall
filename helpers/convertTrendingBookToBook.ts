import { SelectBook, SelectAuthor } from "@/lib/schema";
import { TrendingAuthorsResponse } from "@/types/authorhardcoverresponse";
import { Book } from "@/types/book";
import { TrendingBookData, TrendingImage } from "@/types/trendingbookresponse";

export function convertTrendingBookData(
  trendingData: TrendingBookData,
  authorData: TrendingAuthorsResponse,
  imageData: TrendingImage
): Book[] {
  return Object.values(trendingData.data).map((trendingBookDetails, index) => {
    const book: SelectBook = {
      id: trendingBookDetails.id,
      title: trendingBookDetails.dto_combined.title,
      authorId:
        trendingBookDetails.dto_combined.contributions[0]?.author_id || null,
      image: imageData.data.images.filter(
        (img) => img.id === trendingBookDetails.dto_combined.image_ids[0]
      )[0].url, // Assuming `image_id` is a reference to an image URL or path
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
    };

    const author: SelectAuthor = {
      id: trendingBookDetails.dto_combined.contributions[0].author_id,
      name: authorData.data.authors.filter(
        (au) =>
          au.id === trendingBookDetails.dto_combined.contributions[0]?.author_id
      )[0].name, // Set this if you have the author name elsewhere
      image: "", // Set this if you have the author image elsewhere
    };

    return { book, author };
  });
}
