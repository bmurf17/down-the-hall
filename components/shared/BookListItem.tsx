import { Book } from "@/types/book";
import Link from "next/link";
import { AddToListButton } from "./AddToListButton";

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
    hardcover_id: number
  ) => void;
}

export default function BookListItem({ book, addBookToList }: Props) {
  const number = Math.floor(Math.random() * 7) + 1;

  return (
    <div
      className="flex flex-col md:flex-row justify-between p-4 border-b-2 border-gray-500 hover:bg-slate-200 hover:cursor-pointer"
      key={book.book?.title || ""}
    >
      <Link href={`book/${book.book?.hardcoverId}`}>
        <div className="flex gap-2">
          <div>
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
            <div className="font-serif text-yellow-500 dark:text-yellow-50 underline-offset-4 text-lg no-underline hover:underline decoration-gray-300 dark:decoration-gray-500">
              {book.book?.title}
            </div>

            <div className="text-md">By: {book.author?.name}</div>

            <div className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
              Category
            </div>

            <div className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
              {/* TODO actually get page count */}
              Page Count: {100}
            </div>
          </div>
        </div>
      </Link>
      <div className="flex self-end">
        <AddToListButton
          title={book.book?.title || ""}
          author={book.author?.name || ""}
          image={
            book.book?.image ||
            `https://hardcover.app/images/covers/cover${number}.png`
          }
          //TODO: get physcial edition in
          default_physical_edition_id={0}
          description={book.book?.description ?? ""}
          hardcover_id={book.book?.hardcoverId || 0}
          release_year={book.book?.releaseYear + ""}
          series_length={book.book?.seriesLength || 0}
          series_name={""}
          //TODO: actually load the series correctly
          series_position={0}
          addBookToList={addBookToList}
          buttonText="Add To List"
        />
      </div>
    </div>
  );
}
