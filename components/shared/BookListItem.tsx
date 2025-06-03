"use client";

import { deleteBook, editBook } from "@/actions/bookActions";
import { useToast } from "@/hooks/use-toast";
import { Book } from "@/types/book";
import { readingStatusString } from "@/types/enums/statusEnum";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { AddToListButton } from "./AddToListButton";
import StarRating from "./StarRating";
import { SelectBook } from "@/lib/schema";
import { SignedIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface Props {
  book: Book;
}

export default function BookListItem({ book }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState(book.book?.title);
  const [pageCount, setPageCount] = useState(book.book?.pageCount);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const number = Math.floor(Math.random() * 7) + 1;
  const addbuttonText = () => {
    var status = book.book?.status;

    if (status === null) {
      return readingStatusString[4];
    }

    return readingStatusString[status || 0];
  };

  const bookId = !book.book?.hardcoverId
    ? book.book?.id
    : book.book?.hardcoverId;

  const submit = () => {
    editBook(
      book.book?.id || 0,
      title || "",
      book.book?.status || 0,
      book.book?.rating || "0",
      undefined,
      pageCount || 0
    );
  };
  return (
    <div
      className="flex flex-col md:flex-row justify-between p-4 border-b-2 border-gray-500 hover:bg-slate-200 hover:cursor-pointer"
      key={book.book?.title || ""}
    >
      {/* Main content area */}
      {isEditing ? (
        <div className="flex flex-col md:flex-row gap-2 align-middle flex-1 min-w-0">
          <div className="flex justify-center flex-shrink-0 ">
            <img
              className="w-20 md:w-28 relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
              src={
                book.book?.image ||
                `https://hardcover.app/images/covers/cover${number}.png`
              }
              alt={book.book?.title}
              height={100}
              width={100}
            />
          </div>
          <div className="flex flex-col gap-2 flex-grow min-w-0">
            <input
              className="flex border-2 border-gray-200 p-2 rounded-xl mb-2 w-full"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

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

            <input
              className="flex border-2 border-gray-200 p-2 rounded-xl mb-2 w-full"
              placeholder="Page Count"
              type="number"
              value={pageCount || 0}
              onChange={(e) => setPageCount(+e.target.value)}
            />

            <div className="md:hidden flex justify-center">
              {book.book && book.book.status !== null ? (
                <StarRating book={book.book as SelectBook} />
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <Link href={`/book/${bookId}`} className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row gap-2 align-middle">
            <div className="flex justify-center flex-shrink-0">
              <img
                className="w-20 md:w-28 relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
                src={
                  book.book?.image ||
                  `https://hardcover.app/images/covers/cover${number}.png`
                }
                alt={book.book?.title}
                height={100}
                width={100}
              />
            </div>
            <div className="flex flex-col gap-2 flex-grow min-w-0">
              <div className="text-black underline-offset-4 text-lg md:text-3xl font-bold no-underline hover:underline decoration-gray-300 dark:decoration-gray-500 break-words">
                {title}
              </div>

              <div className="text-md md:text-lg font-semibold text-text">
                By: {book.author?.name}
              </div>

              <div className="text-text text-sm md:text-base font-semibold flex gap-2 flex-wrap">
                {book.book?.genres?.slice(0, 3).join(", ")}
              </div>

              {book.book?.seriesName ? (
                <div className="text-text text-sm md:text-base font-semibold break-words">
                  Series Name: {book.book?.seriesName}
                </div>
              ) : null}

              <div className="text-text text-sm font-semibold">
                Page Count: {pageCount}
              </div>

              <div className="md:hidden flex justify-center">
                {book.book && book.book.status !== null ? (
                  <StarRating book={book.book as SelectBook} />
                ) : null}
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="flex flex-col md:flex-row md:items-end gap-2 mt-4 md:mt-0 flex-shrink-0">
        <div className="hidden md:flex justify-center items-end">
          {book.book && book.book.status !== null ? (
            <StarRating book={book.book as SelectBook} />
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <SignedIn>
            <AddToListButton
              title={book.book?.title || ""}
              author={book.author?.name || ""}
              image={
                book.book?.image ||
                `https://hardcover.app/images/covers/cover${number}.png`
              }
              default_physical_edition_id={
                book.book?.defaultPhysicalEditionId || 0
              }
              description={book.book?.description ?? ""}
              hardcover_id={book.book?.hardcoverId || 0}
              release_year={book.book?.releaseYear + ""}
              series_length={book.book?.seriesLength || 0}
              series_name={book.book?.seriesName || ""}
              series_position={book.book?.seriesPosition || ""}
              buttonText={addbuttonText()}
              page_number={book.book?.pageCount || 0}
              id={book.book?.id || 0}
              rating={book.book?.rating || "0"}
            />
          </SignedIn>

          {book.book?.status !== null ? (
            <>
              <button
                className={clsx(
                  "bg-white border-2 border-primary flex items-center justify-center px-3 py-2 rounded-lg text-sm text-primary hover:bg-opacity-40 whitespace-nowrap",
                  "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                )}
                onClick={() => {
                  setIsLoading(true);
                  deleteBook(book.book?.id ?? 0);

                  toast({
                    title: "Successfully Deleted Book",
                    description: `${book.book?.title} was deleted`,
                  });
                  setIsLoading(false);
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="hidden sm:inline">Deleting...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>

              {isEditing ? (
                <button
                  className={clsx(
                    "bg-white border-2 border-primary flex items-center justify-center px-3 py-2 rounded-lg text-sm text-primary hover:bg-opacity-40 whitespace-nowrap",
                    "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                  )}
                  onClick={() => {
                    submit();
                    setIsEditing(false);

                    toast({
                      title: "Successfully Updated Book",
                      description: `${title} was updated`,
                    });
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="hidden sm:inline">Updating...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
              ) : (
                <button
                  className={clsx(
                    "bg-white border-2 border-primary flex items-center justify-center px-3 py-2 rounded-lg text-sm text-primary hover:bg-opacity-40 whitespace-nowrap",
                    "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                  )}
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="hidden sm:inline">Updating...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <span>Edit</span>
                  )}
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
