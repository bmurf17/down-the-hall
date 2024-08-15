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
import { storage } from "@/lib/firebase-config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { getSignedUrl } from "@/actions/hardcoverActions";

export async function convertTrendingBookData(
  trendingData: TrendingBookData,
  authorData: TrendingAuthorsData,
  imageData: TrendingImageData,
  seriesData: SeriesListResponse
): Promise<Book[]> {
  return await Promise.all(
    Object.values(trendingData).map(async (trendingBookDetails) => {
      var series = seriesData?.series.filter(
        (series) =>
          series.id === trendingBookDetails.dto_combined.series[0]?.series_id
      );

      var image = await handleImage(
        trendingBookDetails.id,
        trendingBookDetails.dto_combined.title,
        imageData.images.filter(
          (img) => img.id === trendingBookDetails.dto_combined.image_ids[0]
        )[0].url
      );

      const book: SelectBook = {
        id: trendingBookDetails.id,
        title: trendingBookDetails.dto_combined.title,
        authorId:
          trendingBookDetails.dto_combined.contributions[0]?.author_id || null,
        image: image,
        status: null,
        releaseYear: trendingBookDetails.dto_combined.release_year,
        defaultPhysicalEditionId:
          trendingBookDetails.default_physical_edition_id, // Set if applicable
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
            au.id ===
            trendingBookDetails.dto_combined.contributions[0]?.author_id
        )[0].name,
        image: "",
      };

      const returnBook: Book = {
        author: author,
        book: book,
      };

      return returnBook;
    })
  );
}

async function handleImage(id: number, bookTitle: string, imageUrl: string) {
  const filePath = `${id}_${bookTitle}.jpeg`;

  const newImageRef = ref(storage, filePath);

  try {
    const imageURL = await getDownloadURL(newImageRef);
    return imageURL || "";
  } catch (error) {
    //assuming the file has not been uploaded to fb
    const signedImageUrl = await getSignedUrl(imageUrl);

    var blob = await urlToBlob(signedImageUrl.data.image_url_signed.url);

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
