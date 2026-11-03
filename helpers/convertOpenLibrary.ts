import "server-only";

import { handleImage, getPublicImageUrl, PLACEHOLDER_IMAGE } from "@/lib/supabase-storage";
import { convertBookData } from "@/lib/books/convert-openlibrary";
import type {
  GoogleBooksSearchResult,
  HardcoverData,
  OpenLibraryBook,
} from "@/lib/books/types";

/**
 * Deterministic, filesystem-friendly id for books that have neither a
 * Hardcover id nor an ISBN. Same title + author always yields the same value,
 * so repeated searches reuse one stored cover instead of uploading a new one.
 */
function stableHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return `h${(hash >>> 0).toString(36)}`;
}

export async function convertBookDataWithImageUpload(
  openLibraryBook: OpenLibraryBook,
  googleBooksData?: GoogleBooksSearchResult | null,
  hardcoverData?: HardcoverData | null
) {
  // First convert the data as before
  const bookData = await convertBookData(
    openLibraryBook,
    googleBooksData,
    hardcoverData
  );

  // Use a stable identity for the stored file. A timestamp here meant every
  // search re-uploaded every cover under a brand new name, leaking storage.
  // Prefer the Hardcover id, then the ISBN, then a deterministic title/author
  // hash so repeated searches (and later "add to list") reuse the same object.
  const stableId =
    bookData.book?.hardcoverId ||
    googleBooksData?.matchedISBN?.replace(/[^0-9Xx]/g, "") ||
    stableHash(`${bookData.book?.title ?? ""}|${bookData.author?.name ?? ""}`);

  // Handle book image upload if we have an image URL
  if (bookData.book) {
    if (bookData.book.image) {
      bookData.book.image = await handleImage(
        stableId,
        bookData.book.title,
        bookData.book.image
      );
    } else {
      bookData.book.image = getPublicImageUrl(PLACEHOLDER_IMAGE);
    }
  }

  // Handle author image upload if needed. Keyed by the author's name so all of
  // their books share one stored portrait instead of one per search/book.
  if (bookData.author?.image) {
    try {
      bookData.author.image = await handleImage(
        stableHash(`author:${bookData.author.name}`),
        `author_${bookData.author.name.replace(/\s+/g, "_")}`,
        bookData.author.image
      );
    } catch (error) {
      console.error("Error caching author image:", error);
      // Keep the original image URL if upload fails
    }
  }

  return bookData;
}
