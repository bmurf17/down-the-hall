import type { SeriesListResponse } from "@/types/trending/seriesHardCoverResponse";

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

/** A book row as returned by Hardcover's GraphQL API. */
export interface HardcoverBook {
  id: number;
  default_physical_edition_id?: number | null;
  users_count?: number;
  users_read_count?: number;
  title: string;
  pages?: number | null;
  release_year?: number | null;
  description?: string | null;
  cached_image?: { url?: string | null } | null;
  cached_contributors?: Array<{
    author?: {
      name: string;
      slug?: string;
      cachedImage?: { url?: string | null } | null;
    } | null;
  }> | null;
  cached_tags?: Record<string, Array<{ tag: string }>> | null;
  genres?: string[] | null;
  book_series?: Array<{
    series_id: number;
    details?: string | null;
    position?: number | null;
    featured?: boolean | null;
  }> | null;
  contributions?: Array<{
    author_id: number;
    contribution?: string | null;
  }> | null;
}

export interface HardcoverBooksResponse {
  books: HardcoverBook[];
}

export interface HardcoverBookByIdResponse {
  books_by_pk: HardcoverBook | null;
}

/** Data passed to the conversion helpers from the Hardcover lookup. */
export interface HardcoverData {
  bookData: {
    books?: HardcoverBook[];
    book0?: HardcoverBook;
    book1?: HardcoverBook;
  };
  seriesData?: SeriesListResponse;
}

export interface HardcoverSearchResult extends HardcoverData {
  matchedISBNs?: string[];
  batchIndex?: number;
}

export interface GoogleBooksSearchResult {
  bookData: GoogleBooksItem;
  matchedISBN: string;
  attempts?: number;
}
