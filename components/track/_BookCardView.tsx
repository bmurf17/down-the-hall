import { Book } from "@/types/book";
import BookListItem from "../shared/BookListItem";

interface Props {
  book: Book;
}

export default function BookCardView({ book }: Props) {
  return <BookListItem book={book} />;
}
