import { Book } from "@/types/book";
import Link from "next/link";
import { AddToListButton } from "./AddToListButton";
import { readingStatusString } from "@/types/statusEnum";
import clsx from "clsx";
import { deleteBook } from "@/actions/bookActions";
import { useToast } from "@/hooks/use-toast";

interface Props {
  book: Book;
}

export default function BookListItem({ book }: Props) {
  const { toast } = useToast();

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
            <div className=" text-black underline-offset-4 text-xl md:text-3xl font-bold  no-underline hover:underline decoration-gray-300 dark:decoration-gray-500">
              {book.book?.title}
            </div>

            <div className="text-md md:text-lg font-semibold text-text">
              By: {book.author?.name}
            </div>

            <div className="text-text text-sm md:text-base font-semibold flex gap-2">
              {book.book?.genres?.slice(0, 3).join(", ")}
            </div>

            {book.book?.seriesName ? (
              <div className="text-text text-sm md:text-base font-semibold">
                Series Name: {book.book?.seriesName}
              </div>
            ) : null}

            <div className="text-text text-sm font-semibold">
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
          series_position={book.book?.seriesPosition || ""}
          buttonText={addbuttonText()}
          page_number={book.book?.pageCount || 0}
          id={book.book?.id || 0}
        />
        {book.book?.status !== null ? (
          <button
            className={clsx(
              "bg-primary flex items-center justify-center p-4 rounded-lg  text-left text-sm/6 text-white",
              "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
            )}
            onClick={() => {
              deleteBook(book.book?.id ?? 0);

              toast({
                title: "Successfully Deleted Book",
                description: `${book.book?.title} was added`,
              });
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
