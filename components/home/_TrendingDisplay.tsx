import { addBookToList } from "@/functions/addBook";
import { Book } from "@/types/book";
import BookListItem from "../shared/BookListItem";

interface Props {
  books: Book[];
}

export default function TrendingDisplay({ books }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {books.map((book) => {
        return <BookListItem book={book} key={book.book?.hardcoverId} />;
      })}
    </div>
  );
}
