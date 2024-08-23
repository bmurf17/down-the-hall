import { addBook } from "@/actions/bookActions";
import { Status } from "@/types/statusEnum";

export const addBookToList = (
  title: string,
  author: string,
  authorImg: string,
  status: number,
  image: string,
  release_year: string,
  default_physical_edition_id: number,
  description: string,
  series_position: number,
  series_length: number,
  series_name: string,
  hardcover_id: number,
  page_count: number
) => {
  if (status == Status.Finished) {
    console.log("test");
  }
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
    status == Status.Finished ? new Date() : undefined
  );
};
