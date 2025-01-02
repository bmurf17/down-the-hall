import { BookSeriesArray } from "@/types/apiResponse/seriesResponse";
import { Book } from "@/types/book";
import BookListItem from "../shared/BookListItem";

interface Props {
  seriesInfo: BookSeriesArray;
  authorName: string;
  seriesBooks: Book[];
}

export default function Series({ seriesInfo, authorName, seriesBooks }: Props) {
  return (
    <>
      {seriesBooks.map((book, index) => {
        book.author = { id: 1, name: authorName, image: "" };
        return (
          <BookListItem
            key={book.book?.title + "" + index || index}
            book={book}
          />
        );
      })}
    </>
  );
}
