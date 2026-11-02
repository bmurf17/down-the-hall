"use server";

import { searchBooksWithGoogleBooks } from "@/lib/books/google";

export const fetchBooks = async (query: string) => {
  const results = await searchBooksWithGoogleBooks({
    title: query,
    limit: 10,
  });

  return results;
};
