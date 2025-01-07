"use server";

import { getBooksByIsbn } from "@/actions/hardcoverActions";
import { searchBooks } from "@/actions/openLibraryActions";

export const fetchBooks = async (query: string) => {
  const openLibraryBooks = await searchBooks(query);

  const isbn13Regex = /\b97[89]-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d\b/;
  const allValidIsbns: string[] = Array.from(
    new Set(
      openLibraryBooks?.flatMap(
        (x) => x?.isbn?.filter((isbn) => isbn13Regex.test(isbn)) || []
      )
    )
  );

  const hardcoverBooks = await getBooksByIsbn(allValidIsbns || []);
  return hardcoverBooks;
};
