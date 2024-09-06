import { Book } from "@/types/book";
import Link from "next/link";
import { AddToListButton } from "./AddToListButton";
import { readingStatusString } from "@/types/statusEnum";
import clsx from "clsx";
import { deleteBook } from "@/actions/bookActions";

interface Props {
  book: Book;
  addBookToList: (
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
    page_number: number
  ) => void;
}

export default function BookListItem({ book, addBookToList }: Props) {
  const number = Math.floor(Math.random() * 7) + 1;
  const addbuttonText = () => {
    var status = book.book?.status;

    if (status === null) {
      return readingStatusString[4];
    }

    return readingStatusString[status || 0];
  };

  return (
    <div
      className="flex flex-col md:flex-row justify-between p-4 border-b-2 border-gray-500 hover:bg-slate-200 hover:cursor-pointer"
      key={book.book?.title || ""}
    >
      <Link href={`book/${book.book?.hardcoverId}`}>
        <div className="flex flex-col md:flex-row gap-2 align-middle">
          <div className="flex justify-center">
            <img
              className="relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
              src={
                book.book?.image ||
                `https://hardcover.app/images/covers/cover${number}.png`
              }
              alt={book.book?.title}
              height={100}
              width={100}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="font-serif text-purple-600 dark:text-yellow-50 underline-offset-4 text-lg no-underline hover:underline decoration-gray-300 dark:decoration-gray-500">
              {book.book?.title}
            </div>

            <div className="text-md">By: {book.author?.name}</div>

            <div className="text-gray-600 dark:text-gray-400 text-sm font-semibold flex gap-2">
              {book.book?.genres?.slice(0, 3).join(", ")}
            </div>

            {book.book?.seriesName ? (
              <div className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                Series Name: {book.book?.seriesName}
              </div>
            ) : null}

            <div className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
              Page Count: {book.book?.pageCount}
            </div>
          </div>
        </div>
      </Link>
      <div className="flex self-end gap-2">
        <AddToListButton
          title={book.book?.title || ""}
          author={book.author?.name || ""}
          image={
            book.book?.image ||
            `https://hardcover.app/images/covers/cover${number}.png`
          }
          default_physical_edition_id={book.book?.defaultPhysicalEditionId || 0}
          description={book.book?.description ?? ""}
          hardcover_id={book.book?.hardcoverId || 0}
          release_year={book.book?.releaseYear + ""}
          series_length={book.book?.seriesLength || 0}
          series_name={book.book?.seriesName || ""}
          series_position={book.book?.seriesPosition || 0}
          buttonText={addbuttonText()}
          page_number={book.book?.pageCount || 0}
        />
        {book.book?.status !== null ? (
          <button
            className={clsx(
              "bg-indigo-600 flex items-center justify-center p-4 rounded-lg  text-left text-sm/6 text-white",
              "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
            )}
            onClick={() => {
              deleteBook(book.book?.id ?? 0);
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
