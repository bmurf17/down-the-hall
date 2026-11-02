import "server-only";

import { convertBookDataWithImageUpload } from "@/helpers/convertOpenLibrary";
import { Book } from "@/types/book";
import type {
  GoogleBooksItem,
  GoogleBooksSearchResult,
  OpenLibraryBook,
  SearchParams,
} from "./types";

// Primary search using Google Books API
export async function searchBooksWithGoogleBooks(
  params: SearchParams
): Promise<Book[] | null> {
  try {
    const googleBooksResults = await searchGoogleBooks(params);

    if (!googleBooksResults || googleBooksResults.length === 0) {
      // Fallback to OpenLibrary if Google Books returns nothing. Imported lazily
      // to avoid a circular dependency with the OpenLibrary module.
      const { enhancedSearchBooks } = await import("./openlibrary");
      console.log(
        "Google Books returned no results, falling back to OpenLibrary"
      );
      return await enhancedSearchBooks(params);
    }

    // Enhanced results combining Google Books with other sources
    const enhancedBooks = await Promise.all(
      googleBooksResults.map(async (googleBook) => {
        let openLibraryData = null;
        let hardcoverData = null;

        const isbns = extractISBNsFromGoogleBook(googleBook);

        if (isbns.length > 0) {
          const { searchOpenLibraryByISBN } = await import("./openlibrary");
          openLibraryData = await searchOpenLibraryByISBN(isbns[0]);
        }

        if (isbns.length > 0) {
          const { searchWithISBNFallbackHardCover } = await import(
            "./hardcover"
          );
          hardcoverData = await searchWithISBNFallbackHardCover(isbns);
        }

        // Conversion uses the OpenLibrary shape for consistency, but Google
        // Books remains the primary result when OpenLibrary had no match.
        const normalizedBook =
          openLibraryData ?? convertGoogleBookToOpenLibrary(googleBook);

        return await convertBookDataWithImageUpload(
          normalizedBook,
          { bookData: googleBook, matchedISBN: isbns[0] || "" },
          hardcoverData
        );
      })
    );

    return enhancedBooks;
  } catch (error) {
    console.error("Error in Google Books primary search:", error);
    const { enhancedSearchBooks } = await import("./openlibrary");
    return await enhancedSearchBooks(params);
  }
}

// Google Books API search with popularity sorting
export async function searchGoogleBooks(
  params: SearchParams
): Promise<GoogleBooksItem[] | null> {
  try {
    const query = buildGoogleBooksQuery(params);
    const maxResults = Math.min(params.limit || 10, 40); // Google Books max is 40

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}&orderBy=relevance&printType=books`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = (await response.json()) as { items?: GoogleBooksItem[] };

    if (!data.items || !Array.isArray(data.items)) {
      return null;
    }

    // Sort by popularity (ratings count * average rating)
    const sortedBooks = data.items
      .filter((item) => {
        // Filter out books without essential information
        return (
          item.volumeInfo.title &&
          item.volumeInfo.authors &&
          item.volumeInfo.industryIdentifiers
        );
      })
      .sort(
        (a, b) =>
          calculateGoogleBooksPopularity(b) -
          calculateGoogleBooksPopularity(a)
      )
      .slice(0, params.limit || 10);

    return sortedBooks;
  } catch (error) {
    console.error("Error searching Google Books:", error);
    return null;
  }
}

// Build optimized search query for Google Books
function buildGoogleBooksQuery(params: SearchParams): string {
  const queryParts: string[] = [];

  if (params.isbn) {
    return `isbn:${params.isbn.replace(/[-\s]/g, "")}`;
  }

  if (params.title) {
    queryParts.push(`intitle:"${params.title}"`);
  }

  if (params.author) {
    queryParts.push(`inauthor:"${params.author}"`);
  }

  // If no specific search terms, return a general query
  if (queryParts.length === 0) {
    return "subject:fiction"; // Default fallback
  }

  return queryParts.join(" ");
}

// Calculate popularity score for Google Books items
function calculateGoogleBooksPopularity(item: GoogleBooksItem): number {
  const ratingsCount = item.volumeInfo.ratingsCount || 0;
  const averageRating = item.volumeInfo.averageRating || 0;

  // Weighted score: ratings count is more important than average rating
  // because it indicates actual engagement
  return ratingsCount * 2 + averageRating * ratingsCount * 0.1;
}

// Extract ISBNs from Google Books item
export function extractISBNsFromGoogleBook(item: GoogleBooksItem): string[] {
  if (!item.volumeInfo.industryIdentifiers) {
    return [];
  }

  return item.volumeInfo.industryIdentifiers
    .filter((id) => id.type === "ISBN_13" || id.type === "ISBN_10")
    .map((id) => id.identifier);
}

// Convert Google Books format to OpenLibrary format for consistency
export function convertGoogleBookToOpenLibrary(
  item: GoogleBooksItem
): OpenLibraryBook {
  const isbns = extractISBNsFromGoogleBook(item);

  return {
    key: `/works/google_${item.id}`,
    title: item.volumeInfo.title,
    author_name: item.volumeInfo.authors,
    first_publish_year: item.volumeInfo.publishedDate
      ? parseInt(item.volumeInfo.publishedDate.substring(0, 4))
      : undefined,
    cover_i: undefined, // Handled by image conversion
    isbn: isbns,
    ia: [],
    description: item.volumeInfo.description,
    pages: item.volumeInfo.pageCount,
    genres: item.volumeInfo.categories?.map((cat) => cat.toLowerCase()),
    rating: item.volumeInfo.averageRating,
    want_to_read_count: item.volumeInfo.ratingsCount || 0,
  };
}

export async function searchWithISBNFallbackGooglebooks(
  isbnList: string[]
): Promise<GoogleBooksSearchResult | null> {
  if (!isbnList || !Array.isArray(isbnList) || isbnList.length === 0) {
    throw new Error(
      "Invalid ISBN list: must provide a non-empty array of ISBNs"
    );
  }

  let result: GoogleBooksSearchResult | null = null;
  const triedISBNs: string[] = [];
  const errors: string[] = [];

  for (const isbn of isbnList) {
    try {
      triedISBNs.push(isbn);

      const bookData = await searchBookByISBNGoogleBooks(isbn);

      if (bookData) {
        result = {
          bookData,
          matchedISBN: isbn,
          attempts: triedISBNs.length,
        };
        break;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push(`Error with ISBN ${isbn}: ${errorMessage}`);
      continue;
    }
  }

  return result;
}

export async function searchBookByISBNGoogleBooks(
  isbn: string
): Promise<GoogleBooksItem | null> {
  try {
    const cleanISBN = isbn.replace(/[-\s]/g, "");

    if (!/^(\d{10}|\d{13})$/.test(cleanISBN)) {
      console.warn(`Invalid ISBN format: ${isbn}. Must be 10 or 13 digits.`);
      return null;
    }

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`;

    const response = await fetch(apiUrl, { cache: "no-store" });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      totalItems: number;
      items?: GoogleBooksItem[];
    };

    if (data.totalItems === 0 || !data.items?.length) {
      return null;
    }

    return data.items[0];
  } catch (error) {
    console.error(`Error searching for book with ISBN ${isbn}:`, error);
    return null;
  }
}
