"use server";

import { book } from "@/lib/schema";
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  HARDCOVER_GRAPHQL_ENDPOINT,
  getHardcoverAuthorizationHeader,
} from "@/lib/hardcover-oauth";

//QUERIES
const TRENDING_BOOKS_QUERY = gql`
  query MyQuery {
    books_trending(limit: 10) {
      ids
    }
  }
`;

const FIND_BOOKS_BY_ISBN_QUERY = gql`
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

const BOOK_BY_ID_QUERY = gql`
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

const SERIES_BY_ID_QUERY = gql`
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

const BOOKS_BY_IDS_QUERY = gql`
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

const SERIES_BY_IDS_QUERY = gql`
  query SeriesByIds($ids: [Int!]!) {
    series(where: { id: { _in: $ids } }) {
      id
      name
    }
  }
`;

export const getBook = async (id: string) => {
  try {
    const booksResponse = await client.query({
      query: BOOK_BY_ID_QUERY,
      variables: { id: parseInt(id, 10) },
    });

    const series = booksResponse.data.books_by_pk?.book_series;
    const seriesResponse =
      series?.length > 0
        ? await client.query({
            query: SERIES_BY_ID_QUERY,
            variables: { id: series[0]?.series_id },
          })
        : null;

    if (seriesResponse?.data) {
      const filteredSeries = seriesResponse.data.series
        .map((series: any) => ({
          ...series,
          book_series: series.book_series.filter(
            (x: any) =>
              !x.book.contributions?.some(
                (contribution: any) =>
                  contribution.contribution === "Translator"
              )
          ),
        }))
        .filter((series: any) => series.book_series.length > 0);

      if (filteredSeries.length > 0) {
        const uniquePositionBooks = filteredSeries[0].book_series.reduce(
          (
            acc: { [x: string]: any },
            current: {
              position: string | number;
              book: { users_read_count: number };
            }
          ) => {
            if (
              !acc[current.position] ||
              acc[current.position].book.users_read_count <
                current.book.users_read_count
            ) {
              acc[current.position] = current;
            }
            return acc;
          },
          {}
        );

        const result = Object.values(uniquePositionBooks).sort(
          (a: any, b: any) => a.position - b.position
        );

        return {
          booksData: booksResponse.data,
          seriesData: result,
        };
      }
    }

    return {
      booksData: booksResponse.data,
      seriesData: [],
    };
  } catch (ex) {
    console.error(`Error fetching Hardcover book ${id}:`, ex);
    return null;
  }
};

function extractSeriesIds(
  books: { book_series?: { series_id: number }[] | null }[]
): number[] {
  return Array.from(
    new Set(
      books
        .map((book) => book.book_series?.[0]?.series_id)
        .filter((id): id is number => typeof id === "number")
    )
  );
}

const httpLink = new HttpLink({
  uri: HARDCOVER_GRAPHQL_ENDPOINT,
});

// Resolve the token per request: OAuth access tokens are short-lived and the
// refresh token rotates, so the Authorization header can't be static.
const authLink = setContext(async (_, { headers }) => ({
  headers: {
    ...headers,
    authorization: await getHardcoverAuthorizationHeader(),
  },
}));

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export async function fetchTrendingData() {
  try {
    const trendingBooksResponse = await client.query({
      query: TRENDING_BOOKS_QUERY,
    });
    const ids = trendingBooksResponse.data.books_trending.ids;

    const booksResponse = await client.query({
      query: BOOKS_BY_IDS_QUERY,
      variables: { ids },
    });

    const seriesIds = extractSeriesIds(booksResponse.data.books);

    const seriesResponse = seriesIds.length
      ? await client.query({
          query: SERIES_BY_IDS_QUERY,
          variables: { ids: seriesIds },
        })
      : { data: { series: [] } };

    return {
      bookData: booksResponse.data,
      seriesData: seriesResponse.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export const getBooksByIsbn = async (isbns: string[]) => {
  try {
    if (isbns.length === 0) {
      return null;
    }

    // Fetch trending book IDs
    const trendingBooksResponse = await client.query({
      query: FIND_BOOKS_BY_ISBN_QUERY,
      variables: { isbns },
    });
    let ids: number[] = Array.from(
      new Set(
        trendingBooksResponse.data.editions.map(
          (x: { book: { id: any } }) => x.book.id
        )
      )
    );

    ids = ids.slice(0, 10);

    if (ids.length === 0) {
      return null;
    }

    // Fetch book details
    const booksResponse = await client.query({
      query: BOOKS_BY_IDS_QUERY,
      variables: { ids },
    });

    const seriesIds = extractSeriesIds(booksResponse.data.books);

    const seriesResponse = seriesIds.length
      ? await client.query({
          query: SERIES_BY_IDS_QUERY,
          variables: { ids: seriesIds },
        })
      : { data: { series: [] } };

    return {
      bookData: booksResponse.data,
      seriesData: seriesResponse.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
