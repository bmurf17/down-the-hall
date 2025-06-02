"use server";

import { editBook } from "@/actions/bookActions";
import { Status } from "@/types/enums/statusEnum";

export const editBookToList = async (
  id: number,
  title: string,
  status: number,
  ranking: string
) => {
  editBook(
    id,
    title,
    status,
    ranking,
    status == Status.Finished ? new Date() : undefined
  );
};
