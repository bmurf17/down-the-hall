"use server";

import { BUCKET_NAME, buildImageFileName, getPublicImageUrl, supabase } from "@/lib/supabase-storage";
import { SelectAuthor, SelectBook } from "@/lib/schema";
import { Book } from "@/types/book";
import { SeriesListResponse } from "@/types/trending/seriesHardCoverResponse";
import {
  TrendingBookData,
  TrendingBookDetails,
} from "@/types/trending/trendingbookresponse";

const placeholderImage = "placeholder.webp";

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

  var series = seriesData?.series?.filter((series) => {
    if (trendingBookDetails?.book_series?.length > 0) {
      return series.id === trendingBookDetails.book_series[0]?.series_id;
    }
  });

  var image = await handleImage(
    trendingBookDetails.id,
    trendingBookDetails.title,
    trendingBookDetails.cached_image?.url || ""
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
    genres: trendingBookDetails.genres,
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

export async function handleImage(
  id: number | string,
  bookTitle: string,
  imageUrl: string
) {
  // Nothing usable upstream: use the shared placeholder.
  if (!imageUrl || imageUrl === placeholderImage) {
    return getPublicImageUrl(placeholderImage);
  }

  // Already stored in our bucket (e.g. a migrated cover) - no work to do.
  if (imageUrl.includes(`/${BUCKET_NAME}/`)) {
    return imageUrl;
  }

  const filePath = buildImageFileName(id, bookTitle);

  const { data: existing, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list("", { search: filePath });

  if (listError) {
    console.error("Error checking Supabase storage:", listError);
  }

  // `search` is a substring match, so confirm the exact object name.
  if (existing?.some((file) => file.name === filePath)) {
    return getPublicImageUrl(filePath);
  }

  try {
    const blob = await urlToBlob(imageUrl);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading image to Supabase:", error);
      // Keep showing the upstream cover rather than masking the failure.
      return imageUrl;
    }

    return getPublicImageUrl(filePath);
  } catch (error) {
    console.error("Error uploading image to Supabase:", error);
    return imageUrl;
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
