"use server";

import { searchBooks } from "@/actions/openLibraryActions";
import { convertOpenLibraryBookData } from "@/helpers/convertOpenLibrary";

export const fetchBooks = async (query: string) => {
  const openLibraryBooks = await searchBooks({
    title: query,
    limit: 5,
  });

  const convertedData = openLibraryBooks?.map((book) =>
    convertOpenLibraryBookData(book)
  );

  return convertedData;
};
