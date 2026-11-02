"use server";

import {
  HARDCOVER_GRAPHQL_ENDPOINT,
  getHardcoverAuthorizationHeader,
} from "@/lib/hardcover-oauth";
import type {
  HardcoverBook,
  HardcoverBookByIdResponse,
  HardcoverBooksResponse,
} from "@/lib/books/types";
import type { BookSeries } from "@/types/apiResponse/seriesResponse";
import type {
  SeriesListResponse,
  SeriesResponse,
} from "@/types/trending/seriesHardCoverResponse";
import type {
  TrendingBookDetails,
  TrendingData,
} from "@/types/trending/trendingbookresponse";

// QUERIES
const TRENDING_BOOKS_QUERY = `
  query TrendingBooks {
    books_trending(limit: 10) {
      ids
    }
  }
`;

const FIND_BOOKS_BY_ISBN_QUERY = `
  query BooksByIsbns($isbns: [String!]!) {
    editions(
      where: { isbn_13: { _in: $isbns } }
      order_by: { book: { user_books_aggregate: { count: desc } } }
    ) {
      book {
        title
        id
      }
    }
  }
`;

const BOOK_BY_ID_QUERY = `
  query BookByID($id: Int!) {
    books_by_pk(id: $id) {
      id
      default_physical_edition_id
      users_count
      users_read_count
      cached_image
      cached_contributors
      description
      release_year
      title
      pages
      cached_tags
      book_series {
        series_id
        details
        position
        featured
      }
      contributions {
        author_id
        contribution
      }
    }
  }
`;

const SERIES_BY_ID_QUERY = `
  query SeriesById($id: Int!) {
    series(where: { id: { _eq: $id } }) {
      id
      name
      book_series {
        position
        book {
          id
          title
          cached_image
          users_read_count
          description
          release_year
          pages
          contributions {
            author_id
            contribution
            author {
              id
              name
            }
          }
          book_series {
            series_id
            position
            details
            featured
          }
          cached_tags
        }
      }
    }
  }
`;

const BOOKS_BY_IDS_QUERY = `
  query BooksByIds($ids: [Int!]!) {
    books(where: { id: { _in: $ids } }) {
      id
      title
      pages
      book_series {
        series_id
        details
        position
        featured
      }
      default_physical_edition_id
      users_count
      users_read_count
      cached_image
      release_year
      description
      cached_contributors
      contributions {
        author_id
        contribution
      }
      cached_tags
    }
  }
`;

const SERIES_BY_IDS_QUERY = `
  query SeriesByIds($ids: [Int!]!) {
    series(where: { id: { _in: $ids } }) {
      id
      name
    }
  }
`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Minimal GraphQL client for Hardcover. Apollo was only used to run a handful
 * of static queries, so a small fetch wrapper keeps it out of the server bundle.
 */
async function hardcoverRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(HARDCOVER_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: await getHardcoverAuthorizationHeader(),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Hardcover GraphQL request failed (${response.status})`);
  }

  const payload = (await response.json()) as GraphQLResponse<T>;

  if (payload.errors?.length) {
    throw new Error(
      `Hardcover GraphQL error: ${payload.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (!payload.data) {
    throw new Error("Hardcover GraphQL response did not include data");
  }

  return payload.data;
}

interface SeriesByIdResponse {
  series: Array<{
    id: number;
    name: string;
    book_series: BookSeries[];
  }>;
}

export interface BookLookupResult {
  booksData: {
    books_by_pk: TrendingBookDetails | null;
  };
  /** Series books, de-duplicated by position and ordered. */
  seriesData: BookSeries[];
  /** Id/name pairs used to label the book's own series. */
  seriesInfo: SeriesListResponse;
}

export const getBook = async (id: string): Promise<BookLookupResult | null> => {
  try {
    const booksData = await hardcoverRequest<HardcoverBookByIdResponse>(
      BOOK_BY_ID_QUERY,
      { id: parseInt(id, 10) }
    );

    const series = booksData.books_by_pk?.book_series;
    const seriesResponse =
      series && series.length > 0
        ? await hardcoverRequest<SeriesByIdResponse>(SERIES_BY_ID_QUERY, {
            id: series[0]?.series_id,
          })
        : null;

    const normalizedBooksData: BookLookupResult["booksData"] = {
      books_by_pk: booksData.books_by_pk as TrendingBookDetails | null,
    };

    if (seriesResponse) {
      const filteredSeries = seriesResponse.series
        .map((seriesRow) => ({
          ...seriesRow,
          book_series: seriesRow.book_series.filter(
            (entry) =>
              !entry.book.contributions?.some(
                (contribution) => contribution.contribution === "Translator"
              )
          ),
        }))
        .filter((seriesRow) => seriesRow.book_series.length > 0);

      if (filteredSeries.length > 0) {
        const uniquePositionBooks = filteredSeries[0].book_series.reduce<
          Record<string, BookSeries>
        >((acc, current) => {
          const key = String(current.position);
          if (
            !acc[key] ||
            (acc[key].book.users_read_count ?? 0) <
              (current.book.users_read_count ?? 0)
          ) {
            acc[key] = current;
          }
          return acc;
        }, {});

        const result = Object.values(uniquePositionBooks).sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0)
        );

        return {
          booksData: normalizedBooksData,
          seriesData: result,
          seriesInfo: {
            series: filteredSeries.map(({ id, name }) => ({ id, name })),
          },
        };
      }
    }

    return {
      booksData: normalizedBooksData,
      seriesData: [],
      seriesInfo: { series: [] },
    };
  } catch (ex) {
    console.error(`Error fetching Hardcover book ${id}:`, ex);
    return null;
  }
};

function extractSeriesIds(books: HardcoverBook[]): number[] {
  return Array.from(
    new Set(
      books
        .map((book) => book.book_series?.[0]?.series_id)
        .filter((id): id is number => typeof id === "number")
    )
  );
}

async function fetchSeries(seriesIds: number[]): Promise<SeriesListResponse> {
  if (seriesIds.length === 0) {
    return { series: [] };
  }

  return hardcoverRequest<SeriesListResponse>(SERIES_BY_IDS_QUERY, {
    ids: seriesIds,
  });
}

export async function fetchTrendingData(): Promise<TrendingData> {
  try {
    const trendingBooksResponse = await hardcoverRequest<{
      books_trending: { ids: number[] };
    }>(TRENDING_BOOKS_QUERY);
    const ids = trendingBooksResponse.books_trending.ids;

    const booksData = await hardcoverRequest<HardcoverBooksResponse>(
      BOOKS_BY_IDS_QUERY,
      { ids }
    );

    const seriesData = await fetchSeries(extractSeriesIds(booksData.books));

    return {
      // Hardcover's generated shape is structurally compatible with the
      // narrower TrendingBookDetails type used by the UI.
      bookData: { books: booksData.books as TrendingBookDetails[] },
      seriesData,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export interface IsbnLookupResult {
  bookData: { books: HardcoverBook[] };
  seriesData: SeriesListResponse;
}

export const getBooksByIsbn = async (
  isbns: string[]
): Promise<IsbnLookupResult | null> => {
  try {
    if (isbns.length === 0) {
      return null;
    }

    const editionsResponse = await hardcoverRequest<{
      editions: Array<{ book: { id: number } }>;
    }>(FIND_BOOKS_BY_ISBN_QUERY, { isbns });

    const ids = Array.from(
      new Set(editionsResponse.editions.map((edition) => edition.book.id))
    ).slice(0, 10);

    if (ids.length === 0) {
      return null;
    }

    const booksData = await hardcoverRequest<HardcoverBooksResponse>(
      BOOKS_BY_IDS_QUERY,
      { ids }
    );

    const seriesData = await fetchSeries(extractSeriesIds(booksData.books));

    return {
      bookData: { books: booksData.books },
      seriesData,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export type { SeriesResponse };
