import { editBook } from "@/actions/bookActions";
import { Book } from "@/types/book";
import BookListItem from "../shared/BookListItem";

interface Props {
  book: Book;
}

export default function BookCardView({ book }: Props) {
  const bookObject = book.book;
  const author = book.author;

  const addBookToList = (
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
    editBook(
      bookObject?.id || 0,
      title,
      status,
      author,
      "",
      +release_year,
      image,
      default_physical_edition_id,
      series_position,
      description,
      series_length,
      page_count
    );
  };

  return <BookListItem book={book} addBookToList={addBookToList} />;
}
