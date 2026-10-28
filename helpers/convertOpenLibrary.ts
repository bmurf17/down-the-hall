import { OpenLibraryBook } from "@/actions/openLibraryActions";
import { getPublicImageUrl, PLACEHOLDER_IMAGE } from "@/lib/supabase-storage";
import { Book } from "@/types/book";
import { handleImage } from "./convertTrendingBookToBook";

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

interface GoogleBooksData {
  kind: string;
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
  };
}

interface HardcoverBookData {
  book0?: {
    __typename: string;
    id: number;
    default_physical_edition_id: number;
    users_count: number;
    users_read_count: number;
    title: string;
    pages: number;
    cached_image?: {
      url?: string;
    };
    description: string;
    genres: string[];
    series: {
      series_id: number;
      details: string;
      position: number;
      featured: boolean;
    }[];
    release_year: number;
    cached_contributors?: Array<{
      author?: {
        name: string;
        slug: string;
        cachedImage?: {
          url?: string;
        };
      };
    }>;
  };
  book1?: {
    // Same structure as book0
  };
}

interface HardcoverData {
  bookData: HardcoverBookData;
  seriesData?: {
    series?: Array<{
      __typename: string;
      id: number;
      name: string;
    }>;
  };
}

export async function convertBookData(
  openLibraryBook: OpenLibraryBook,
  googleBooksData?: {
    bookData: GoogleBooksData;
    matchedISBN: string;
  } | null,
  hardcoverData?: HardcoverData | null
) {
  // Initialize with OpenLibrary data
  let authorName = openLibraryBook?.author_name?.[0] ?? "";
  let authorImage = null;
  let bookImage = openLibraryBook.cover_i
    ? `https://covers.openlibrary.org/b/id/${openLibraryBook.cover_i}-L.jpg`
    : "";
  let bookTitle = openLibraryBook.title;
  let bookDescription = openLibraryBook.description || "";
  let releaseYear = openLibraryBook.first_publish_year || 0;
  let pageCount = openLibraryBook.pages || 0;
  let genres = openLibraryBook.genres || [];
  let seriesName = openLibraryBook.series_name || "";
  let seriesPosition = openLibraryBook.series_position || null;
  let seriesLength = openLibraryBook.series_length || null;
  let rating = openLibraryBook.rating || null;
  let hardcoverId = null;
  let defaultPhysicalEditionId = 0;

  // Enhance with Google Books data if available
  if (googleBooksData?.bookData) {
    const gbData = googleBooksData.bookData;

    // Prefer Google Books description if available and longer
    if (
      gbData.volumeInfo.description &&
      (!bookDescription ||
        gbData.volumeInfo.description.length > bookDescription.length)
    ) {
      bookDescription = gbData.volumeInfo.description;
    }

    // Use Google Books image if OpenLibrary doesn't have one
    if (!bookImage && gbData.volumeInfo.imageLinks?.thumbnail) {
      bookImage = gbData.volumeInfo.imageLinks.thumbnail;
    }

    // Use Google Books page count if not available from OpenLibrary
    if (!pageCount && gbData.volumeInfo.pageCount) {
      pageCount = gbData.volumeInfo.pageCount;
    }

    // Merge genres/categories
    if (gbData.volumeInfo.categories?.length) {
      const googleGenres = gbData.volumeInfo.categories.map((cat) =>
        cat.toLowerCase()
      );

      // Merge and deduplicate genres manually
      const allGenres = [...genres];
      googleGenres.forEach((genre) => {
        if (!allGenres.includes(genre)) {
          allGenres.push(genre);
        }
      });

      genres = allGenres;
    }

    // Extract year from publishedDate if available
    if (!releaseYear && gbData.volumeInfo.publishedDate) {
      const yearMatch = gbData.volumeInfo.publishedDate.match(/\d{4}/);
      if (yearMatch) {
        releaseYear = parseInt(yearMatch[0]);
      }
    }

    // Use author from Google Books if not available from OpenLibrary
    if (!authorName && gbData.volumeInfo.authors?.[0]) {
      authorName = gbData.volumeInfo.authors[0];
    }
  }

  // Enhance with Hardcover data if available
  if (hardcoverData?.bookData) {
    const hcData = hardcoverData.bookData;
    const book0 = hcData.book0;

    if (book0) {
      // Set Hardcover IDs
      hardcoverId = book0.id;
      defaultPhysicalEditionId = book0.default_physical_edition_id;

      // Use Hardcover description if available and better quality
      if (
        book0.description &&
        (!bookDescription || book0.description.length > bookDescription.length)
      ) {
        bookDescription = book0.description;
      }

      if (book0.cached_image?.url) {
        bookImage = book0.cached_image.url;
      }

      if (book0.pages !== null && book0.pages !== undefined) {
        pageCount = book0.pages;
      }

      // Use Hardcover genres if available
      if (book0.genres?.length) {
        const hardcoverGenres = book0.genres;

        // Merge and deduplicate genres manually
        hardcoverGenres.forEach((genre) => {
          if (!genres.includes(genre)) {
            genres.push(genre);
          }
        });
      }

      // Use Hardcover release year if available
      if (book0.release_year) {
        releaseYear = book0.release_year;
      }

      // Use Hardcover author information if available
      if (book0.cached_contributors?.[0]?.author) {
        authorName = book0.cached_contributors[0].author.name;
        if (book0.cached_contributors[0].author.cachedImage?.url) {
          authorImage = book0.cached_contributors[0].author.cachedImage.url;
        }
      }

      // Use Hardcover series information if available
      if (book0.series?.length && hardcoverData.seriesData?.series?.length) {
        const seriesEntry =
          book0.series.find((s) => s.featured) || book0.series[0];
        if (seriesEntry) {
          const seriesInfo = hardcoverData.seriesData.series.find(
            (s) => s.id === seriesEntry?.series_id
          );
          if (seriesInfo) {
            const sp =
              seriesEntry.position !== null && seriesEntry.position !== undefined
                ? seriesEntry.position
                : null;
            seriesName = seriesInfo.name;
            seriesPosition = sp !== undefined ? sp : null;
          }
        }
      } else if (book0.series?.length && !hardcoverData.seriesData?.series?.length) {
        // If series data not loaded separately, try to use what we have
        const seriesEntry =
          book0.series.find((s) => s.featured) || book0.series[0];
        if (seriesEntry) {
          const sp =
            seriesEntry.position !== null && seriesEntry.position !== undefined
              ? seriesEntry.position
              : null;
          if ((seriesEntry as any).name) {
            seriesName = (seriesEntry as any).name;
          }
          seriesPosition = sp !== undefined ? sp : null;
        }
      }
    }
  }

  // Clean up series name if it was stringified as an object
  if (typeof seriesName === "string" && seriesName.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(seriesName);
      if (parsed && typeof parsed === "object") {
        if (parsed.name) {
          seriesName = parsed.name;
        } else if (parsed.series?.name) {
          seriesName = parsed.series.name;
        } else if (parsed.title) {
          seriesName = parsed.title;
        } else {
          seriesName = "";
        }
        if (seriesPosition == null && parsed.position) {
          const pos = parsed.position;
          const numericPosition =
            typeof pos === "number" ? pos : parseFloat(pos);
          seriesPosition = Number.isNaN(numericPosition) ? null : numericPosition;
        } else if (seriesPosition == null && parsed.series?.position) {
          const pos = parsed.series.position;
          const numericPosition =
            typeof pos === "number" ? pos : parseFloat(pos);
          seriesPosition = Number.isNaN(numericPosition) ? null : numericPosition;
        }
      }
    } catch (e) {
      // If it's not valid JSON, leave as is
    }
  }

  // Create and return the book data
  const returnValue: Book = {
    book: {
      id: 0,
      image: bookImage,
      userId: null,
      title: bookTitle,
      authorId: null,
      status: null,
      releaseYear,
      defaultPhysicalEditionId,
      description: bookDescription,
      seriesPosition: seriesPosition != null ? seriesPosition + "" : null,
      seriesLength,
      seriesName: typeof seriesName === "string" ? seriesName : "",
      pageCount,
      genres,
      hardcoverId,
      dateRead: null,
      updatedDate: null,
      rating: "0",
    },
    author: {
      name: authorName,
      id: 0,
      image: authorImage,
    },
    book_notes: null,
  };

  return returnValue;
}

export async function convertBookDataWithImageUpload(
  openLibraryBook: OpenLibraryBook,
  googleBooksData?: {
    bookData: GoogleBooksData;
    matchedISBN: string;
  } | null,
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
