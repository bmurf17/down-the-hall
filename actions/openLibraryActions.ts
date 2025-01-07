export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn: string[];
}

export async function searchBooks(
  title: string,
  limit: number = 5
): Promise<OpenLibraryBook[] | null> {
  const searchParams = new URLSearchParams({
    title: title,
    limit: limit.toString(),
  });
  const response = await fetch(
    `https://openlibrary.org/search.json?${searchParams}`
  );

  if (!response.ok)
    throw new Error(`OpenLibrary API error: ${response.status}`);

  const data = await response.json();
  return data.docs || null;
}
