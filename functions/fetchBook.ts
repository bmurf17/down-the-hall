"use server";

import { editBook } from "@/actions/bookActions";
import { getBooks } from "@/actions/hardcoverActions";
import { Status } from "@/types/enums/statusEnum";

export const fetchBooks = async (query: string) => {
  return await getBooks(query);
};
