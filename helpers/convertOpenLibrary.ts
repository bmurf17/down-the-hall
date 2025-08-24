import { OpenLibraryBook } from "@/actions/openLibraryActions";
import { Book } from "@/types/book";
import { handleImage } from "./convertTrendingBookToBook";

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
    dto_combined: {
      description?: string;
      page_count?: number;
      genres?: string[];
      release_year?: number;
      title: string;
      subtitle?: string;
      series?: Array<{
        series_id: number;
        details?: string;
        position?: number;
        featured?: boolean;
      }>;
    };
    cached_image?: {
      url?: string;
    };
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
        book0.dto_combined.description &&
        (!bookDescription ||
          book0.dto_combined.description.length > bookDescription.length)
      ) {
        bookDescription = book0.dto_combined.description;
      }

      if (book0.cached_image?.url) {
        bookImage = book0.cached_image.url;
      }

      if (book0.pages) {
        pageCount = book0.pages;
      }

      // Use Hardcover genres if available
      if (book0.dto_combined.genres?.length) {
        const hardcoverGenres = book0.dto_combined.genres;

        // Merge and deduplicate genres manually
        hardcoverGenres.forEach((genre) => {
          if (!genres.includes(genre)) {
            genres.push(genre);
          }
        });
      }

      // Use Hardcover release year if available
      if (book0.dto_combined.release_year) {
        releaseYear = book0.dto_combined.release_year;
      }

      // Use Hardcover author information if available
      if (book0.cached_contributors?.[0]?.author) {
        authorName = book0.cached_contributors[0].author.name;
        if (book0.cached_contributors[0].author.cachedImage?.url) {
          authorImage = book0.cached_contributors[0].author.cachedImage.url;
        }
      }

      // Use Hardcover series information if available
      if (
        book0.dto_combined.series?.length &&
        hardcoverData.seriesData?.series?.length
      ) {
        const seriesEntry = book0.dto_combined.series.find((s) => s.featured);
        if (seriesEntry) {
          const seriesInfo = hardcoverData.seriesData.series.find(
            (s) => s.id === seriesEntry.series_id
          );
          if (seriesInfo) {
            var sp =
              seriesEntry.position !== null ? seriesEntry.position : null;
            seriesName = seriesInfo.name;
            seriesPosition = sp !== undefined ? sp : null;
          }
        }
      }
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
      seriesPosition: seriesPosition + "",
      seriesLength,
      seriesName,
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

  // Generate a temporary ID for the book if it doesn't have one
  const tempId = bookData.book?.id || Date.now();

  // Handle image upload to Firebase if we have an image URL
  if (bookData.book?.image) {
    try {
      // Upload the book image to Firebase
      const firebaseImageUrl = await handleImage(
        tempId,
        bookData.book.title,
        bookData.book.image
      );

      // Update the book image URL with the Firebase URL
      bookData.book.image = firebaseImageUrl;
    } catch (error) {
      console.error("Error uploading book image to Firebase:", error);
      // Keep the original image URL if upload fails
    }
  }

  // Handle author image upload if needed
  if (bookData.author?.image) {
    try {
      // Upload the author image to Firebase
      const authorImageUrl = await handleImage(
        tempId,
        `author_${bookData.author.name.replace(/\s+/g, "_")}`,
        bookData.author.image
      );

      // Update the author image URL with the Firebase URL
      bookData.author.image = authorImageUrl;
    } catch (error) {
      console.error("Error uploading author image to Firebase:", error);
      // Keep the original image URL if upload fails
    }
  }

  return bookData;
}
