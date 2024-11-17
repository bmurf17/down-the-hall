"use server";

import { editBook } from "@/actions/bookActions";
import { Status } from "@/types/statusEnum";

export const editBookToList = async (
  id: number,
  title: string,
  status: number,
  ranking: string
) => {
  console.log(status);
  console.log(Status.Finished);

  editBook(
    id,
    title,
    status,
    ranking,
    status == Status.Finished ? new Date() : undefined
  );
};
