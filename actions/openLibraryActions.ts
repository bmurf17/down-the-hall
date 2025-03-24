import { getBooksByIsbn } from "./hardcoverActions";
import { Book } from "@/types/book";
import { convertBookDataWithImageUpload } from "@/helpers/convertOpenLibrary";

export interface SearchParams {
  title?: string;
  author?: string;
  isbn?: string;
  limit?: number;
}
export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  ia?: string[];
  description?: string;
  series_name?: string;
  series_position?: number;
  series_length?: number;
  page_count?: number;
  genres?: string[];
  rating?: number;
}

export async function enhancedSearchBooks(
  params: SearchParams
): Promise<Book[] | null> {
  try {
    // First, search OpenLibrary
    const openLibraryBooks = await searchBooks(params);
    if (!openLibraryBooks || openLibraryBooks.length === 0) {
      return null;
    }

    // For each book, enhance with Google Books and Hardcover data
    const enhancedBooks = await Promise.all(
      openLibraryBooks.map(async (olBook) => {
        let googleBooksData = null;
        let hardcoverData = null;

        // Try to get Google Books data if ISBNs are available
        if (olBook.isbn && olBook.isbn.length > 0) {
          googleBooksData = await searchWithISBNFallbackGooglebooks(
            olBook.isbn
          );
        }

        // Try to get Hardcover data if ISBNs are available
        if (olBook.isbn && olBook.isbn.length > 0) {
          hardcoverData = await searchWithISBNFallbackHardCover(olBook.isbn);
        }

        // Combine all data sources
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
      "key,title,author_name,first_publish_year,cover_i,isbn,ia"
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

    const data = await response.json();
    if (!data.docs || !Array.isArray(data.docs)) {
      return null;
    }

    const books: OpenLibraryBook[] = await Promise.all(
      data.docs.map(async (doc: any) => {
        const book: OpenLibraryBook = {
          key: doc.key || "",
          title: doc.title || "",
          author_name: doc.author_name || undefined,
          first_publish_year: doc.first_publish_year || undefined,
          cover_i: doc.cover_i || undefined,
          isbn: doc.isbn || [],
          ia: doc.ia || [],
        };

        if (doc.key) {
          const workResponse = await fetch(
            `https://openlibrary.org${doc.key}.json`
          );

          if (workResponse.ok) {
            const workData = await workResponse.json();

            searchWithISBNFallbackGooglebooks(book.isbn || []);
            searchWithISBNFallbackHardCover(book.isbn || []);

            book.description =
              typeof workData.description === "string"
                ? workData.description
                : workData.description?.value;

            book.page_count = workData.number_of_pages || undefined;

            if (workData.subjects) {
              book.genres = workData.subjects.map((subject: string) =>
                subject.toLowerCase()
              );
            }

            // Series Information (if available)
            if (workData.series) {
              book.series_name = workData.series[0];
            }
            if (workData.series_position) {
              book.series_position = parseFloat(workData.series_position);
            }

            // Ratings (if available)
            if (workData.ratings_average) {
              book.rating = parseFloat(workData.ratings_average);
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

export async function searchBookByISBNGoogleBooks(isbn: string) {
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

    const data = await response.json();

    if (data.totalItems === 0) {
      return null;
    }

    return data.items[0];
  } catch (error) {
    console.error(`Error searching for book with ISBN ${isbn}:`, error);
    return null;
  }
}

export async function searchWithISBNFallbackGooglebooks(isbnList: string[]) {
  if (!isbnList || !Array.isArray(isbnList) || isbnList.length === 0) {
    throw new Error(
      "Invalid ISBN list: must provide a non-empty array of ISBNs"
    );
  }

  let result = null;
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

export async function searchBookByISBNHardcover(isbns: string[]): Promise<any> {
  try {
    if (!isbns || isbns.length === 0) {
      console.warn("No ISBNs provided for hardcover search");
      return null;
    }

    // Process ISBNs in batches of 10
    const isbnBatch = isbns.slice(0, 10);

    // Fetch book details using the provided getBooksByIsbn function
    const result = await getBooksByIsbn(isbnBatch);

    if (!result) {
      return null;
    }

    return result;
  } catch (error) {
    console.error(
      `Error searching for books with ISBNs ${isbns.join(", ")}:`,
      error
    );
    return null;
  }
}

export async function searchWithISBNFallbackHardCover(
  isbnList: string[]
): Promise<any> {
  if (!isbnList || !Array.isArray(isbnList) || isbnList.length === 0) {
    throw new Error(
      "Invalid ISBN list: must provide a non-empty array of ISBNs"
    );
  }

  let result = null;
  const errors: string[] = [];
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push(
        `Error with ISBNs batch starting at index ${i}: ${errorMessage}`
      );
      continue;
    }
  }

  return result;
}
