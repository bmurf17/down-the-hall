import { storage } from "@/lib/firebase-config";
import { SelectAuthor, SelectBook } from "@/lib/schema";
import { Book } from "@/types/book";
import { SeriesListResponse } from "@/types/trending/seriesHardCoverResponse";
import {
  TrendingBookData,
  TrendingBookDetails,
} from "@/types/trending/trendingbookresponse";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const placeholderImage = "placeholder.png";

export async function convertTrendingBookData(
  trendingData: TrendingBookData,
  seriesData: SeriesListResponse
): Promise<Book[]> {
  return await Promise.all(
    Object.values(trendingData).map((trendingBookDetails, index) =>
      processTrendingBookDetails(trendingBookDetails, seriesData)
    )
  );
}

export const processTrendingBookDetails = async (
  trendingBookDetails: TrendingBookDetails,
  seriesData: SeriesListResponse
): Promise<Book> => {
  var series = seriesData?.series?.filter((series) => {
    if (trendingBookDetails.dto_combined?.series?.length > 0) {
      return (
        series.id === trendingBookDetails.dto_combined.series[0]?.series_id
      );
    }
  });

  var image = await handleImage(
    trendingBookDetails.id,
    trendingBookDetails.dto_combined.title,
    trendingBookDetails.cached_image.url || placeholderImage
  );

  const book: SelectBook = {
    id: trendingBookDetails.id,
    title: trendingBookDetails.dto_combined.title,
    authorId:
      trendingBookDetails.dto_combined.contributions?.length > 0
        ? trendingBookDetails.dto_combined.contributions[0]?.author_id || null
        : 0,
    image: image,
    status: null,
    releaseYear: trendingBookDetails.dto_combined.release_year,
    defaultPhysicalEditionId: trendingBookDetails.default_physical_edition_id,
    description: trendingBookDetails.dto_combined.description,
    seriesPosition:
      trendingBookDetails.dto_combined.series?.length > 0
        ? trendingBookDetails.dto_combined.series[0]?.position || null
        : null,
    seriesLength: trendingBookDetails.dto_combined.series?.length
      ? trendingBookDetails.dto_combined.series.length || null
      : null,
    seriesName: series?.length > 0 ? series[0].name : "",
    hardcoverId: trendingBookDetails.id,
    pageCount: trendingBookDetails.dto_combined.page_count,
    genres: trendingBookDetails.dto_combined.genres,
    dateRead: Date.now().toString(),
    updatedDate: Date.now().toString(),
    userId: "",
  };

  const author: SelectAuthor = {
    id:
      trendingBookDetails.dto_combined.contributions?.length > 0
        ? trendingBookDetails.dto_combined.contributions[0].author_id
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
  };

  return returnBook;
};

async function handleImage(id: number, bookTitle: string, imageUrl: string) {
  const filePath =
    imageUrl !== placeholderImage
      ? `${id}_${bookTitle}.jpeg`
      : placeholderImage;

  const newImageRef = ref(storage, filePath);

  try {
    const imageURL = await getDownloadURL(newImageRef);
    return imageURL || "";
  } catch (error) {
    //assuming the file has not been uploaded to fb
    var blob = await urlToBlob(imageUrl);

    const newImageRef = ref(storage, filePath);
    await uploadBytesResumable(newImageRef, blob);

    return (await getDownloadURL(newImageRef)) || "";
  }
}

async function urlToBlob(url: string): Promise<Blob> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error("Error fetching the image:", error);
    throw error;
  }
}
