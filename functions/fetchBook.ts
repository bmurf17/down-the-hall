"use server";

import { enhancedSearchBooks } from "@/actions/openLibraryActions";

export const fetchBooks = async (query: string) => {
  const convertedData = await enhancedSearchBooks({
    title: query,
    limit: 5,
  });

  return convertedData?.filter(
    (book) =>
      book.book?.image &&
      book.book.image !== "" &&
      !book.book.image.toLowerCase().includes("hardcover")
  );
};
