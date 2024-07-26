
//TODO: Move to typesense
export const getBooks = async (title: string) => {

  if (title === "") {
    return []
  }

  const headers = {
    'content-type': "application/json",
    'Authorization': `${process.env.HARDCOVER_TOKEN}`
  }

  const requestBody = {
    query: `query Test {
  books(where: {title: {_ilike: "%${title}%"}}, order_by: {users_count: desc}, limit: 10) {
    id
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
}`
  }

  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  }

  const response = await (await fetch(process.env.HARCOVER_URL || "", options)).json();

  return response
}

export const getBook = async (id: string) => {
  const headers = {
    'content-type': "application/json",
    'Authorization': `${process.env.HARDCOVER_TOKEN}`
  }

  const requestBody = {
    query: `query Test {
              books(where: {id: {_eq: "${id}"}}, order_by: {users_count: desc}, limit: 1) {
              id
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
            }`
  }

  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  }

  const response = await (await fetch(process.env.HARCOVER_URL || "", options)).json();

  return response
}