"use server";

import { addBook } from "@/actions/bookActions";
import { Status } from "@/types/enums/statusEnum";
import { currentUser } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

export const addBookToList = async (
  title: string,
  author: string,
  authorImg: string,
  status: number,
  image: string,
  release_year: string,
  default_physical_edition_id: number,
  description: string,
  series_position: string,
  series_length: number,
  series_name: string,
  hardcover_id: number,
  page_count: number
) => {
  const userRightNow = await currentUser();

  addBook(
    title,
    author,
    "",
    status,
    image,
    release_year,
    default_physical_edition_id,
    description,
    series_position,
    series_length,
    series_name,
    hardcover_id,
    page_count,
    userRightNow,
    status == Status.Finished ? new Date() : undefined
  );

  revalidateTag(`user-${userRightNow?.id}`);
  revalidateTag(`user-data`);
};
