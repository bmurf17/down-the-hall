import { Book } from "@/types/book";

interface Props {
  book: Book;
}

export default function BookListView({ book }: Props) {
  const bookObject = book.book;
  const author = book.author;

  return (
    <div className="flex gap-4">
      <img
        className="relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
        src={bookObject?.image || ""}
        alt={bookObject?.title}
        height={100}
        width={100}
      />
      <div className="flex flex-col gap-2 justify-center">
        <div>{bookObject?.title}</div>
        <div>{author?.name}</div>
        <div>{bookObject?.pageCount}</div>
      </div>
    </div>
  );
}
