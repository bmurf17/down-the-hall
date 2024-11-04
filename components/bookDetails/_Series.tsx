import { useEffect, useState } from "react";
import { processBookSeriesDetails } from "@/helpers/convertSeriesBook";
import { BookSeriesArray } from "@/types/apiResponse/seriesResponse";
import BookListItem from "../shared/BookListItem";
import { Book } from "@/types/book";

interface Props {
  seriesInfo: BookSeriesArray;
  authorName: string;
  seriesBooks: Book[];
}

export default function Series({ seriesInfo, authorName, seriesBooks }: Props) {
  return (
    <>
      {seriesBooks.map((book, index) => (
        <BookListItem key={book.book?.title || index} book={book} />
      ))}
    </>
  );
}
