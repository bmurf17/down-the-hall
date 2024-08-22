import { addBook } from "@/actions/bookActions";
import { Book } from "@/types/book";
import BookListItem from "../shared/BookListItem";

interface Props {
  books: Book[];
}

export default function TrendingDisplay({ books }: Props) {
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
      page_count
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <>
          {books.map((book) => {
            return (
              <BookListItem
                book={book}
                addBookToList={addBookToList}
                key={book.book?.hardcoverId}
              />
            );
          })}
        </>
      </div>
    </>
  );
}
