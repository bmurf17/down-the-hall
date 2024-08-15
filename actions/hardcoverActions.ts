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
  query TrendingBooks {
    books_trending(limit: 10, from: ${monthString}, offset: 0) {
      ids
    }
  }
`;

const FIND_BOOKS_QUERY = (title: string) => gql`
  query TrendingBooks {
    books(where: {title: {_ilike: "%${title}%"}}, order_by: {users_count: desc}, limit: 10) {
      id
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

const BOOKS_BY_IDS_QUERY = (ids: number[]) => gql`
  query BooksByIds {
    ${ids
      .map(
        (id, index) => `
        book${index}: books_by_pk(id: ${id}) {
          id
          default_physical_edition_id
          users_count
          users_read_count      
          dto_combined
        }
      `
      )
      .join("")}
  }
`;

const AUTHORS_BY_IDS_QUERY = (authorIds: number[]) => gql`
  query AuthorsByIds {
    authors(where: {id: {_in: [${authorIds.join(",")}]}}) {
      id
      name
    }
  }
`;

const IMAGES_BY_IDS_QUERY = (imageIds: number[]) => gql`
  query ImagesByIds {
    images(where: {id: {_in: [${imageIds.join(",")}]}}) {
      id
      url
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

    // Fetch book details
    const booksResponse = await client.query({
      query: BOOKS_BY_IDS_QUERY(ids),
    });

    const authorIds = Object.values(booksResponse.data)
      .map((book: any) =>
        book.dto_combined.contributions?.map(
          (contribution: any) => contribution.author_id
        )
      )
      .flat();

    // Fetch author details
    const authorsResponse = await client.query({
      query: AUTHORS_BY_IDS_QUERY(authorIds),
    });

    const imageIds = Object.values(booksResponse.data).map((book: any) => {
      if (book.dto_combined?.image_ids?.length > 0) {
        return book.dto_combined.image_id;
      }
    });

    // Fetch image details
    const imagesResponse = await client.query({
      query: IMAGES_BY_IDS_QUERY(imageIds),
    });

    const seriesIds = Object.values(booksResponse.data)
      .filter(
        (book: any) =>
          book.dto_combined.series?.length > 0 && book.dto_combined.series
      )
      .map((book: any) => book.dto_combined.series[0].series_id);

    const seriesResponse = await client.query({
      query: SERIES_BY_IDS_QUERY(seriesIds),
    });

    return {
      bookData: booksResponse.data,
      authorData: authorsResponse.data,
      imageData: imagesResponse.data,
      seriesData: seriesResponse.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getBook = async (id: string) => {
  const headers = {
    "content-type": "application/json",
    Authorization: `${process.env.HARDCOVER_TOKEN}`,
  };

  const requestBody = {
    query: `query Test {
              books(where: {id: {_eq: "${id}"}}, order_by: {users_count: desc}, limit: 1) {
              id
              release_year
              image {
                url
              }
              title
              book_characters {
                id
              }
              book_series {
                position
                details
                series {
                  author {
                   name
                  }
                  book_series {
                    series {
                      books_count
                      is_completed
                      name
                    }
                  }
                }
              }
              description
              dto
              editions {
                dto
                pages
                id
              }
              default_physical_edition_id
              }
            }`,
  };

  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  };

  const response = await (
    await fetch(process.env.HARCOVER_URL || "", options)
  ).json();

  return response;
};

const client = new ApolloClient({
  uri: process.env.HARCOVER_URL || "",
  cache: new InMemoryCache(),
  headers: {
    "content-type": "application/json",
    Authorization: `${process.env.HARDCOVER_TOKEN}`,
  },
});

export async function fetchTrendingData() {
  try {
    // Fetch trending book IDs
    const trendingBooksResponse = await client.query({
      query: TRENDING_BOOKS_QUERY,
      variables: { from: monthString },
    });
    const ids = trendingBooksResponse.data.books_trending.ids;

    // Fetch book details
    const booksResponse = await client.query({
      query: BOOKS_BY_IDS_QUERY(ids),
    });

    const authorIds = Object.values(booksResponse.data)
      .map((book: any) =>
        book.dto_combined.contributions.map(
          (contribution: any) => contribution.author_id
        )
      )
      .flat();

    // Fetch author details
    const authorsResponse = await client.query({
      query: AUTHORS_BY_IDS_QUERY(authorIds),
    });

    const imageIds = Object.values(booksResponse.data).map(
      (book: any) => book.dto_combined.image_ids[0]
    );

    // Fetch image details
    const imagesResponse = await client.query({
      query: IMAGES_BY_IDS_QUERY(imageIds),
    });

    const seriesIds = Object.values(booksResponse.data)
      .filter((book: any) => book.dto_combined.series.length > 0)
      .map((book: any) => book.dto_combined.series[0].series_id);

    const seriesResponse = await client.query({
      query: SERIES_BY_IDS_QUERY(seriesIds),
    });

    return {
      bookData: booksResponse.data,
      authorData: authorsResponse.data,
      imageData: imagesResponse.data,
      seriesData: seriesResponse.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function getSignedUrl(url: string) {
  const data = await client.query({
    query: GET_SIGNED_BOOK_URL(url),
  });

  return data;
}
