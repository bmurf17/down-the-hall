"use server";

import { searchBooksWithGoogleBooks } from "@/actions/openLibraryActions";

export const fetchBooks = async (query: string) => {
  const results = await searchBooksWithGoogleBooks({
    title: query,
    limit: 10,
  });

  return results;
};
