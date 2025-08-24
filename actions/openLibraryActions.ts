import { getBooksByIsbn } from "./hardcoverActions";
import { Book } from "@/types/book";
import { convertBookDataWithImageUpload } from "@/helpers/convertOpenLibrary";

export interface SearchParams {
  title?: string;
  author?: string;
  isbn?: string;
  limit?: number;
}

export interface GoogleBooksItem {
  kind: string;
  id: string;
  etag?: string;
  selfLink?: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    readingModes?: {
      text: boolean;
      image: boolean;
    };
    pageCount?: number;
    printType?: string;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    maturityRating?: string;
    allowAnonLogging?: boolean;
    contentVersion?: string;
    panelizationSummary?: {
      containsEpubBubbles: boolean;
      containsImageBubbles: boolean;
    };
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
    language?: string;
    previewLink?: string;
    infoLink?: string;
    canonicalVolumeLink?: string;
  };
  saleInfo?: {
    country?: string;
    saleability: string;
    isEbook: boolean;
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
    buyLink?: string;
    offers?: Array<{
      finskyOfferType: number;
      listPrice: {
        amountInMicros: number;
        currencyCode: string;
      };
      retailPrice: {
        amountInMicros: number;
        currencyCode: string;
      };
    }>;
  };
  accessInfo?: {
    country?: string;
    viewability?: string;
    embeddable?: boolean;
    publicDomain?: boolean;
    textToSpeechPermission?: string;
    epub?: {
      isAvailable: boolean;
      acsTokenLink?: string;
    };
    pdf?: {
      isAvailable: boolean;
      acsTokenLink?: string;
    };
    webReaderLink?: string;
    accessViewStatus?: string;
    quoteSharingAllowed?: boolean;
  };
  searchInfo?: {
    textSnippet?: string;
  };
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
  pages?: number;
  genres?: string[];
  rating?: number;
  want_to_read_count: number;
}

// Primary search using Google Books API
export async function searchBooksWithGoogleBooks(
  params: SearchParams
): Promise<Book[] | null> {
  try {
    const googleBooksResults = await searchGoogleBooks(params);

    if (!googleBooksResults || googleBooksResults.length === 0) {
      // Fallback to OpenLibrary if Google Books returns nothing
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

        // Extract ISBNs from Google Books data
        const isbns = extractISBNsFromGoogleBook(googleBook);

        // Try to get additional data from OpenLibrary
        if (isbns.length > 0) {
          openLibraryData = await searchOpenLibraryByISBN(isbns[0]);
        }

        // Try to get Hardcover data
        if (isbns.length > 0) {
          hardcoverData = await searchWithISBNFallbackHardCover(isbns);
        }

        // Convert Google Books format to OpenLibrary format for consistency
        const normalizedBook = convertGoogleBookToOpenLibrary(googleBook);

        // Combine all data sources
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
    // Fallback to original method
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

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      return null;
    }

    // Sort by popularity (ratings count * average rating)
    const sortedBooks = data.items
      .filter((item: GoogleBooksItem) => {
        // Filter out books without essential information
        return (
          item.volumeInfo.title &&
          item.volumeInfo.authors &&
          item.volumeInfo.industryIdentifiers
        );
      })
      .sort((a: GoogleBooksItem, b: GoogleBooksItem) => {
        const scoreA = calculateGoogleBooksPopularity(a);
        const scoreB = calculateGoogleBooksPopularity(b);
        return scoreB - scoreA;
      })
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
function extractISBNsFromGoogleBook(item: GoogleBooksItem): string[] {
  if (!item.volumeInfo.industryIdentifiers) {
    return [];
  }

  return item.volumeInfo.industryIdentifiers
    .filter((id) => id.type === "ISBN_13" || id.type === "ISBN_10")
    .map((id) => id.identifier);
}

// Convert Google Books format to OpenLibrary format for consistency
function convertGoogleBookToOpenLibrary(
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
    cover_i: undefined, // Will be handled by image conversion
    isbn: isbns,
    ia: [],
    description: item.volumeInfo.description,
    pages: item.volumeInfo.pageCount,
    genres: item.volumeInfo.categories?.map((cat) => cat.toLowerCase()),
    rating: item.volumeInfo.averageRating,
    want_to_read_count: item.volumeInfo.ratingsCount || 0,
  };
}

// Search OpenLibrary by ISBN for additional metadata
async function searchOpenLibraryByISBN(
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

    const data = await response.json();
    return data.docs && data.docs.length > 0 ? data.docs[0] : null;
  } catch (error) {
    console.error("Error searching OpenLibrary by ISBN:", error);
    return null;
  }
}

// Alternative search strategy with multiple attempts
export async function searchBooksWithFallback(
  params: SearchParams
): Promise<Book[] | null> {
  // Strategy 1: Google Books primary
  let results = await searchBooksWithGoogleBooks(params);
  if (results && results.length > 0) {
    return results;
  }

  // Strategy 2: Try different query variations for Google Books
  if (params.title) {
    const variations = [
      { ...params, title: params.title.replace(/^The\s+/i, "") }, // Remove "The"
      { ...params, title: params.title.split(" ").slice(0, 3).join(" ") }, // First 3 words
    ];

    for (const variation of variations) {
      results = await searchBooksWithGoogleBooks(variation);
      if (results && results.length > 0) {
        return results;
      }
    }
  }

  // Strategy 3: Fallback to original OpenLibrary method
  console.log("All Google Books strategies failed, using OpenLibrary fallback");
  return await enhancedSearchBooks(params);
}

// Keep your existing functions for backward compatibility
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
          want_to_read_count: doc.want_to_read_count || 0,
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

            book.pages = workData.number_of_pages || undefined;

            if (workData.subjects) {
              book.genres = workData.subjects.map((subject: string) =>
                subject.toLowerCase()
              );
            }

            if (workData.series) {
              book.series_name = workData.series[0];
            }
            if (workData.series_position) {
              book.series_position = parseFloat(workData.series_position);
            }

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
