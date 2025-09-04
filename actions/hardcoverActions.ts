"use server";

import { book } from "@/lib/schema";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

//QUERIES
function getMonthString(date: Date): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[date.getMonth()];
}

const date = new Date();
const monthString = getMonthString(date);

const TRENDING_BOOKS_QUERY = gql`
  query MyQuery {
    books_trending(from: "", limit: 10, offset: 10, to: "") {
      ids
    }
  }
`;

const FIND_BOOKS_QUERY = (title: string) => gql`
  query TrendingBooks {
    books(
      where: { title: { _eq: "${title}" } }
      order_by: { users_count: desc }
      limit: 10
    ) {
      id
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

const GET_SIGNED_BOOK_URL = (url: string) => gql`
  query SignUrl {
    image_url_signed(
      url: "${url}"
    ) {
      url
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

const BOOKS_BY_IDS_QUERY = (ids: number[]) => gql`
  query BooksByIds {
    ${ids
      .map(
        (id, index) => `
        book${index}: books_by_pk(id: ${id}) {
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
        }
      `
      )
      .join("")}
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

export const getBooks = async (title: string) => {
  try {
    if (title === "") {
      return null;
    }

    // Fetch trending book IDs
    const trendingBooksResponse = await client.query({
      query: FIND_BOOKS_QUERY(title),
    });

    const ids = trendingBooksResponse.data.books.map(
      (book: { id: any }) => book.id
    );

    if (ids.length === 0) {
      return null;
    }

    // Fetch book details
    const booksResponse = await client.query({
      query: BOOKS_BY_IDS_QUERY(ids),
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

const client = new ApolloClient({
  uri: process.env.HARCOVER_URL || "",
  cache: new InMemoryCache({
    typePolicies: {
      images: {
        keyFields: ["id"], // Ensures Apollo uses `id` as a unique cache key for each image
      },
    },
  }),
  headers: {
    "content-type": "application/json",
    Authorization: `${process.env.HARDCOVER_TOKEN}`,
  },
});

export async function fetchTrendingData() {
  try {
    const trendingBooksResponse = await client.query({
      query: TRENDING_BOOKS_QUERY,
      variables: { from: monthString },
    });
    const ids = trendingBooksResponse.data.books_trending.ids;

    const booksResponse = await client.query({
      query: BOOKS_BY_IDS_QUERY(ids),
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

export async function getSignedUrl(url: string) {
  try {
    const data = await client.query({
      query: GET_SIGNED_BOOK_URL(url),
    });

    if (
      !data ||
      !data.data ||
      !data.data.image_url_signed ||
      !data.data.image_url_signed.url
    ) {
      throw new Error("Invalid response structure from signed URL query");
    }

    return data.data.image_url_signed.url;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    // You might want to return a default or placeholder URL here
    return url; // Return the original URL if signing fails
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
      query: BOOKS_BY_IDS_QUERY(ids),
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
