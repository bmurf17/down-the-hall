import "server-only";

import { convertBookDataWithImageUpload } from "@/helpers/convertOpenLibrary";
import { Book } from "@/types/book";
import { searchWithISBNFallbackGooglebooks } from "./google";
import { searchWithISBNFallbackHardCover } from "./hardcover";
import type { OpenLibraryBook, SearchParams } from "./types";

interface OpenLibrarySeriesEntry {
  name?: unknown;
  title?: unknown;
  position?: unknown;
  series?: {
    name?: unknown;
    position?: unknown;
  };
}

interface OpenLibraryWork {
  description?: string | { value?: string };
  number_of_pages?: number;
  subjects?: string[];
  series?: Array<string | OpenLibrarySeriesEntry>;
  series_position?: string | number | null;
  ratings_average?: string | number;
}

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  ia?: string[];
  want_to_read_count?: number;
}

export async function enhancedSearchBooks(
  params: SearchParams
): Promise<Book[] | null> {
  try {
    const openLibraryBooks = await searchBooks(params);
    if (!openLibraryBooks || openLibraryBooks.length === 0) {
      return null;
    }

    const enhancedBooks = await Promise.all(
      openLibraryBooks.map(async (olBook) => {
        let googleBooksData = null;
        let hardcoverData = null;

        if (olBook.isbn && olBook.isbn.length > 0) {
          googleBooksData = await searchWithISBNFallbackGooglebooks(
            olBook.isbn
          );
        }

        if (olBook.isbn && olBook.isbn.length > 0) {
          hardcoverData = await searchWithISBNFallbackHardCover(olBook.isbn);
        }

        return await convertBookDataWithImageUpload(
          olBook,
          googleBooksData,
          hardcoverData
        );
      })
    );

    return enhancedBooks;
  } catch (error) {
    console.error("Error in enhanced book search:", error);
    throw error;
  }
}

export async function searchBooks(
  params: SearchParams
): Promise<OpenLibraryBook[] | null> {
  try {
    const searchParams = new URLSearchParams();

    if (params.title) searchParams.append("title", params.title);
    if (params.author) searchParams.append("author", params.author);
    if (params.isbn) searchParams.append("isbn", params.isbn);

    searchParams.set("limit", (params.limit || 5).toString());
    searchParams.set(
      "fields",
      "key,title,author_name,first_publish_year,cover_i,isbn,ia,want_to_read_count,"
    );

    const response = await fetch(
      `https://openlibrary.org/search.json?${searchParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OpenLibrary API error: ${response.status}`);
    }

    const data = (await response.json()) as { docs?: OpenLibraryDoc[] };
    if (!data.docs || !Array.isArray(data.docs)) {
      return null;
    }

    const books: OpenLibraryBook[] = await Promise.all(
      data.docs.map(async (doc) => {
        const book: OpenLibraryBook = {
          key: doc.key || "",
          title: doc.title || "",
          author_name: doc.author_name || undefined,
          first_publish_year: doc.first_publish_year || undefined,
          cover_i: doc.cover_i || undefined,
          isbn: doc.isbn || [],
          ia: doc.ia || [],
          want_to_read_count: doc.want_to_read_count || 0,
        };
        if (doc.key) {
          const workResponse = await fetch(
            `https://openlibrary.org${doc.key}.json`
          );

          if (workResponse.ok) {
            const workData = (await workResponse.json()) as OpenLibraryWork;

            book.description =
              typeof workData.description === "string"
                ? workData.description
                : workData.description?.value;

            book.pages = workData.number_of_pages || undefined;

            if (workData.subjects) {
              book.genres = workData.subjects.map((subject) =>
                subject.toLowerCase()
              );
            }

            applySeriesData(book, workData);

            if (workData.ratings_average) {
              book.rating = parseFloat(String(workData.ratings_average));
            }
          }
        }

        return book;
      })
    );

    return books;
  } catch (error) {
    console.error("Error searching OpenLibrary:", error);
    throw error;
  }
}

// Search OpenLibrary by ISBN for additional metadata
export async function searchOpenLibraryByISBN(
  isbn: string
): Promise<OpenLibraryBook | null> {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?isbn=${isbn}&fields=key,title,author_name,first_publish_year,cover_i,isbn,ia,want_to_read_count`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { docs?: OpenLibraryBook[] };
    return data.docs && data.docs.length > 0 ? data.docs[0] : null;
  } catch (error) {
    console.error("Error searching OpenLibrary by ISBN:", error);
    return null;
  }
}

function toPosition(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isNaN(parsed) ? undefined : parsed;
}

function applySeriesData(book: OpenLibraryBook, workData: OpenLibraryWork) {
  if (workData.series && workData.series.length > 0) {
    const seriesEntry = workData.series[0];

    if (typeof seriesEntry === "string") {
      book.series_name = seriesEntry;
    } else if (seriesEntry && typeof seriesEntry === "object") {
      if (typeof seriesEntry.name === "string") {
        book.series_name = seriesEntry.name;
      } else if (
        seriesEntry.series &&
        typeof seriesEntry.series === "object" &&
        typeof seriesEntry.series.name === "string"
      ) {
        book.series_name = seriesEntry.series.name;
      } else if (typeof seriesEntry.title === "string") {
        book.series_name = seriesEntry.title;
      }

      // OpenLibrary returns objects like
      // { series: { key: '/series/...' }, position: '6' }.
      book.series_position =
        toPosition(seriesEntry.position) ??
        toPosition(seriesEntry.series?.position) ??
        book.series_position;
    }
  }

  const workPosition = toPosition(workData.series_position);
  if (workPosition !== undefined) {
    book.series_position = workPosition;
  }
}
