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
    books_trending(from: "", limit: 10, offset: 10, to: "") {
      ids
    }
  }
`;

const FIND_BOOKS_BY_ISBN_QUERY = (isbns: string[]) => gql`
query BooksByIsbns {
 editions(
   where: {isbn_13: {_in: [${isbns.map((isbn) => `"${isbn}"`).join(", ")}]}}
   order_by: {book: {user_books_aggregate: {count: desc}}}
 ) {
   book {
     title 
     id
   }
 }
}
`;

const BOOK_BY_ID_QUERY = (id: string) => gql`
  query BookByID {
    books_by_pk(id: ${id}) {
      id
      default_physical_edition_id
      users_count
      users_read_count      
      cached_image
      cached_contributors
      description
      release_year
      title
    }
  }
`;

const SERIES_BY_ID_QUERY = (id: number) => gql`
  query SeriesByIds {
    series(where: {id: {_eq: ${id}}}) {
      id
      name
    book_series {
        position
        book{
          id
          title
          cached_image
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
      book_series { series_id details position featured }
      default_physical_edition_id
      users_count
      users_read_count
      cached_image
      release_year
      description
      cached_contributors
    }
  }
`;

const SERIES_BY_IDS_QUERY = (seriesIds: number[]) => gql`
  query SeriesByIds {
    series(where: {id: {_in: [${seriesIds.join(",")}]}}) {
      id
      name
    }
  }
`;

export const getBook = async (id: string) => {
  try {
    const booksResponse = await client.query({
      query: BOOK_BY_ID_QUERY(id),
    });

    var seriesResponse =
      booksResponse.data.books_by_pk?.series?.length > 0
        ? await client.query({
            query: SERIES_BY_ID_QUERY(
              booksResponse.data.books_by_pk?.series[0]?.series_id
            ),
          })
        : null;

    if (seriesResponse?.data) {
      var filteredSeries = seriesResponse?.data.series
        .map((book: any) => ({
          ...book,
          book_series: book.book_series.filter(
            (x: any) =>
              x.book.country_id === 1 &&
              !x.book.contributions.some(
                (contribution: any) =>
                  contribution.contribution === "Translator"
              )
          ),
        }))
        .filter((book: any) => book.book_series.length > 0);

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

    return {
      booksData: booksResponse.data,
      seriesData: {},
    };
  } catch (ex) {
    console.log(ex);
  }
};

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

    const seriesIds = Object.values(booksResponse.data)
      .filter((book: any) => book.book_series)
      .map((book: any) => book.book_series[0]?.series_id);

    const seriesResponse = await client.query({
      query: SERIES_BY_IDS_QUERY(seriesIds),
    });

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
      query: FIND_BOOKS_BY_ISBN_QUERY(isbns),
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

    const seriesIds = Object.values(booksResponse.data)
      .filter((book: any) => book.series?.length > 0 && book.series)
      .map((book: any) => book.series[0]?.series_id);

    const seriesResponse = await client.query({
      query: SERIES_BY_IDS_QUERY(seriesIds),
    });

    return {
      bookData: booksResponse.data,
      seriesData: seriesResponse.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
