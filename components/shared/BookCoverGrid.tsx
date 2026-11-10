import Link from "next/link";
import { Book } from "@/types/book";
import { BookCover } from "./BookCover";

interface Props {
  books: Book[];
}

/** Cover-forward two-column grid used on phones for search results. */
export function BookCoverGrid({ books }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:hidden">
      {books.map((book) => {
        const bookObject = book.book;
        const hardcoverId = bookObject?.hardcoverId;
        const hasHardcoverId =
          typeof hardcoverId === "number" && hardcoverId > 0;

        const content = (
          <div className="flex h-full flex-col">
            <BookCover
              src={bookObject?.image}
              alt={bookObject?.title}
              className="w-full shadow-[0_10px_18px_-10px_rgba(30,20,10,0.6)] ring-1 ring-black/10"
            />
            <div className="mt-2 min-w-0">
              <p className="line-clamp-2 font-serif text-sm font-semibold leading-tight">
                {bookObject?.title}
              </p>
              {book.author?.name ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {book.author.name}
                </p>
              ) : null}
            </div>
          </div>
        );

        return hasHardcoverId ? (
          <Link
            key={hardcoverId}
            href={`/book/${hardcoverId}`}
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {content}
          </Link>
        ) : (
          <div key={`${bookObject?.title}-${book.author?.name}`}>{content}</div>
        );
      })}
    </div>
  );
}
