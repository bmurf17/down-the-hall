import "server-only";

import { getBooksByIsbn } from "@/actions/hardcoverActions";
import type { HardcoverSearchResult } from "./types";

export async function searchWithISBNFallbackHardCover(
  isbnList: string[]
): Promise<HardcoverSearchResult | null> {
  if (!isbnList || !Array.isArray(isbnList) || isbnList.length === 0) {
    throw new Error(
      "Invalid ISBN list: must provide a non-empty array of ISBNs"
    );
  }

  let result: HardcoverSearchResult | null = null;
  const batchSize = 10;

  // Process ISBNs in batches of 10
  for (let i = 0; i < isbnList.length; i += batchSize) {
    try {
      const isbnBatch = isbnList.slice(i, i + batchSize);
      const batchResult = await searchBookByISBNHardcover(isbnBatch);

      if (batchResult) {
        result = {
          ...batchResult,
          matchedISBNs: isbnBatch,
          batchIndex: i / batchSize,
        };
        break;
      }
    } catch (error) {
      console.error(
        `Error with ISBNs batch starting at index ${i}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  return result;
}

export async function searchBookByISBNHardcover(
  isbns: string[]
): Promise<HardcoverSearchResult | null> {
  try {
    if (!isbns || isbns.length === 0) {
      console.warn("No ISBNs provided for hardcover search");
      return null;
    }

    // Process ISBNs in batches of 10
    const isbnBatch = isbns.slice(0, 10);
    const result = await getBooksByIsbn(isbnBatch);

    return result ?? null;
  } catch (error) {
    console.error(
      `Error searching for books with ISBNs ${isbns.join(", ")}:`,
      error
    );
    return null;
  }
}
