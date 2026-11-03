import "server-only";

import { convertBookDataWithImageUpload } from "@/helpers/convertOpenLibrary";
import { Book } from "@/types/book";
import { searchWithISBNFallbackGooglebooks } from "./google";
import { searchWithISBNFallbackHardCover } from "./hardcover";
import type { OpenLibraryBook, SearchParams } from "./types";

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  ia?: string[];
  want_to_read_count?: number;
  description?: string;
  number_of_pages_median?: number;
  subject?: string[];
  ratings_average?: number;
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
    // Search returns the work metadata inline (description, median page count,
    // subjects and ratings), so there is no need to request each work document
    // separately - that used to fan out into one extra request per result.
    searchParams.set(
      "fields",
      [
        "key",
        "title",
        "author_name",
        "first_publish_year",
        "cover_i",
        "isbn",
        "ia",
        "want_to_read_count",
        "description",
        "number_of_pages_median",
        "subject",
        "ratings_average",
      ].join(",")
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

    return data.docs.map((doc) => {
      const book: OpenLibraryBook = {
        key: doc.key || "",
        title: doc.title || "",
        author_name: doc.author_name || undefined,
        first_publish_year: doc.first_publish_year || undefined,
        cover_i: doc.cover_i || undefined,
        isbn: doc.isbn || [],
        ia: doc.ia || [],
        want_to_read_count: doc.want_to_read_count || 0,
        description: doc.description,
        pages: doc.number_of_pages_median || undefined,
        genres: doc.subject?.map((subject) => subject.toLowerCase()),
        rating:
          typeof doc.ratings_average === "number"
            ? doc.ratings_average
            : undefined,
      };

      return book;
    });
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
