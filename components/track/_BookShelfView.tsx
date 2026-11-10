import Link from "next/link";
import { Book } from "@/types/book";
import { BookCover } from "../shared/BookCover";

interface Props {
  book: Book;
}

export default function BookShelfView({ book }: Props) {
  const bookObject = book.book;
  const author = book.author;
  const hardcoverId = bookObject?.hardcoverId;
  const hasHardcoverId = typeof hardcoverId === "number" && hardcoverId > 0;

  const content = (
    <div className="group flex h-full flex-col">
      <div className="relative mx-auto w-full transition-transform duration-300 ease-out group-hover:-translate-y-2 group-focus-visible:-translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <BookCover
          src={bookObject?.image}
          alt={bookObject?.title}
          className="w-full shadow-[0_12px_20px_-10px_rgba(30,20,10,0.65)] ring-1 ring-black/10"
        />

        {/* The spine edge gives the cover physical depth. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-sm bg-gradient-to-r from-black/35 via-black/10 to-transparent" />

        {/* Rotated spine text slides in when the book is pulled out. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-5 overflow-hidden rounded-l-sm bg-[#6d4b32]/95 opacity-0 shadow-[2px_0_4px_rgba(0,0,0,0.25)] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
          <span className="absolute inset-0 flex rotate-180 items-center justify-center whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.2em] text-[#f8efe2] [writing-mode:vertical-rl]">
            {bookObject?.title}
            {author?.name ? ` · ${author.name}` : ""}
          </span>
        </div>

        {/* A soft contact shadow anchors the book to the shelf. */}
        <div className="pointer-events-none absolute inset-x-1 -bottom-1 h-2 rounded-full bg-black/20 blur-sm" />
      </div>

      <div className="relative -mx-1 mt-1 h-2 rounded-sm bg-gradient-to-b from-[#a87a50] to-[#6f4a2e] shadow-[0_3px_5px_rgba(40,25,12,0.35)]" />

      <div className="mt-2 min-w-0 text-center">
        <p className="line-clamp-2 font-serif text-xs font-semibold leading-tight">
          {bookObject?.title}
        </p>
        {author?.name ? (
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
            {author.name}
          </p>
        ) : null}
      </div>
    </div>
  );

  return hasHardcoverId ? (
    <Link
      href={`/book/${hardcoverId}`}
      className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
}
