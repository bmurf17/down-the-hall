//TODO: Move to typesense
export const getBooks = async (title: string) => {
  if (title === "") {
    return [];
  }

  const headers = {
    "content-type": "application/json",
    Authorization: `${process.env.HARDCOVER_TOKEN}`,
  };

  const requestBody = {
    query: `query Test {
  books(where: {title: {_ilike: "%${title}%"}}, order_by: {users_count: desc}, limit: 10) {
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
        name
        books_count
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

export const getTrendingByMonth = async () => {
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

  // Step 1: Fetch the IDs from the first query
  const headers = {
    "content-type": "application/json",
    Authorization: `${process.env.HARDCOVER_TOKEN}`,
  };

  const requestBody = {
    query: `
  query {
    books_trending(limit: 10, from: ${monthString}, offset: 0) {
      ids
    }
  }
`,
  };

  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  };

  const response = await (
    await fetch(process.env.HARCOVER_URL || "", options)
  ).json();

  // Execute the query to get the IDs
  const ids = response.data.books_trending.ids;

  const requestBody2 = {
    query: `
    query {
      ${ids
        .map(
          (id: number, index: number) => `
        book${index}: books_by_pk(id: ${id}) {
          id
          users_count
          users_read_count      
          dto_combined
        }
      `
        )
        .join("")}
    }
  `,
  };

  const options2 = {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody2),
  };

  return await (await fetch(process.env.HARCOVER_URL || "", options2)).json();
};
