export interface SearchParams {
  title?: string;
  author?: string;
  isbn?: string;
  limit?: number;
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
  page_count?: number;
  genres?: string[];
  rating?: number;
}

export async function searchBooks(
  params: SearchParams
): Promise<OpenLibraryBook[] | null> {
  try {
    const searchParams = new URLSearchParams();

    // Build search query based on provided parameters
    if (params.title) searchParams.append("title", params.title);
    if (params.author) searchParams.append("author", params.author);
    if (params.isbn) searchParams.append("isbn", params.isbn);

    searchParams.set("limit", (params.limit || 5).toString());
    searchParams.set(
      "fields",
      "key,title,author_name,first_publish_year,cover_i,isbn,ia"
    );

    const response = await fetch(
      `https://openlibrary.org/search.json?${searchParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OpenLibrary API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.docs || !Array.isArray(data.docs)) {
      return null;
    }

    // Fetch additional details for each book
    const books: OpenLibraryBook[] = await Promise.all(
      data.docs.map(async (doc: any) => {
        const book: OpenLibraryBook = {
          key: doc.key || "",
          title: doc.title || "",
          author_name: doc.author_name || undefined,
          first_publish_year: doc.first_publish_year || undefined,
          cover_i: doc.cover_i || undefined,
          isbn: doc.isbn || [],
          ia: doc.ia || [],
        };

        // Fetch additional details from Open Library's Works API
        if (doc.key) {
          const workResponse = await fetch(
            `https://openlibrary.org${doc.key}.json`
          );

          if (workResponse.ok) {
            const workData = await workResponse.json();

            book.description =
              typeof workData.description === "string"
                ? workData.description
                : workData.description?.value;

            book.page_count = workData.number_of_pages || undefined;

            if (workData.subjects) {
              book.genres = workData.subjects.map((subject: string) =>
                subject.toLowerCase()
              );
            }

            // Series Information (if available)
            if (workData.series) {
              book.series_name = workData.series[0];
            }
            if (workData.series_position) {
              book.series_position = parseFloat(workData.series_position);
            }

            // Ratings (if available)
            if (workData.ratings_average) {
              book.rating = parseFloat(workData.ratings_average);
            }
          }
        }

        return book;
      })
    );

    return books;
  } catch (error) {
    console.error("Error searching OpenLibrary:", error);
    throw error;
  }
}
