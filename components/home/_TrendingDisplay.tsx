import { addBook } from "@/actions/bookActions";
import { Book } from "@/types/book";
import BookListItem from "../shared/BookListItem";
import { addBookToList } from "@/functions/addBook";

interface Props {
  books: Book[];
}

export default function TrendingDisplay({ books }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {books.map((book) => {
        return (
          <BookListItem
            book={book}
            addBookToList={addBookToList}
            key={book.book?.hardcoverId}
          />
        );
      })}
    </div>
  );
}
