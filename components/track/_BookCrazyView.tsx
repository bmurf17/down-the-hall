import { Book } from "@/types/book";
import "./_crazyBook.css";

interface Props {
  book: Book;
}

export default function BookCrazyView({ book }: Props) {
  const bookObject = book.book;
  const author = book.author;

  return (
    <div className="book-wrapper">
      <div className="book-items">
        <div className="main-book-wrap">
          <div className="book-cover">
            <div className="book-inside"></div>
            <div className="book-image">
              <img src={bookObject?.image || ""} />
              <div className="effect"></div>
              <div className="light"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
