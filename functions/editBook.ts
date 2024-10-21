"use server";

import { editBook } from "@/actions/bookActions";

export const editBookToList = async (
  id: number,
  title: string,
  status: number,
  ranking: string
) => {
  editBook(id, title, status, ranking);
};
