import { addBook, deleteBook, editBook } from "@/actions/bookActions";
import { Book } from "@/types/book";
import clsx from "clsx";
import { AddToListButton } from "../shared/AddToListButton";
import { readingStatusString } from "@/types/statusEnum";

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
    hardcover_id: number
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
      series_length
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between border-b-2 border-gray-500 hover:bg-slate-200 hover:cursor-pointer pb-2">
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
        </div>
      </div>

      <div className="flex align-bottom self-center gap-4">
        <AddToListButton
          title={bookObject?.title ?? ""}
          author={author?.name ?? ""}
          image={
            bookObject?.image ??
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTURsU0h9PB1mXojMRR8ZAwnvg8v98oMA7wA&s"
          }
          default_physical_edition_id={
            bookObject?.defaultPhysicalEditionId || 0
          }
          description={bookObject?.description ?? ""}
          hardcover_id={bookObject?.id ?? 0}
          release_year={bookObject?.releaseYear?.toString() ?? "1900"}
          series_length={bookObject?.seriesLength || 0}
          series_name={bookObject?.seriesName ?? ""}
          series_position={bookObject?.seriesPosition ?? 0}
          addBookToList={addBookToList}
          buttonText={readingStatusString[bookObject?.status ?? 0]}
        />

        <button
          className={clsx(
            "bg-indigo-600 flex items-center justify-center p-4 rounded-lg  text-left text-sm/6 text-white",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
          )}
          onClick={() => {
            deleteBook(bookObject?.id ?? 0);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
