"use server";

import { addBook, editBook } from "@/actions/bookActions";
import { Status } from "@/types/statusEnum";
import { currentUser } from "@clerk/nextjs/server";

export const editBookToList = async (
  id: number,
  title: string,
  status: number
) => {
  editBook(id, title, status);
};
