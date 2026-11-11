import { Book } from "@/types/book";
import BookCardView from "./_BookCardView";
import BookListView from "./_BookListView";
import BookShelfView from "./_BookShelfView";
import BookSpinesView from "./_BookSpinesView";
import BookCrazyView from "./_BookCrazyView";

interface Props {
  books: Book[];
  selectedView: string | undefined;
  viewOptions: string[];
}

import { cn } from "@/lib/utils";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { EmptyState } from "../shared/EmptyState";
import { buttonVariants } from "../ui/button";

export default function TrackBookViewLogic({
  books,
  selectedView,
  viewOptions,
}: Props) {
  if (books.length === 0) {
    return (
      <div className="mt-4 rounded-xl bg-card p-3">
        <EmptyState
          icon={BookOpen}
          title="No books here yet"
          description="Try a different status, or add a book from Find."
          action={
            <Link href="/find" className={buttonVariants({ className: "min-h-11" })}>
              Find a book
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-card p-3 animate-fade-in-grow mt-4",
        "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
      )}
    >
      {selectedView === viewOptions[0] ? (
        <div className="flex flex-col gap-2">
          {books.map((book) => {
            return <BookCardView key={book?.book?.id} book={book} />;
          })}
        </div>
      ) : (
        <>
          {selectedView === viewOptions[1] ? (
            <>
              {/* The table is a desktop tool; phones get the regular rows. */}
              <div className="flex flex-col gap-2 md:hidden">
                {books.map((book) => (
                  <BookCardView key={book?.book?.id} book={book} />
                ))}
              </div>
              <div className="hidden flex-col gap-2 md:flex">
                <BookListView books={books} />
              </div>
            </>
          ) : (
            <>
              {selectedView === viewOptions[2] ? (
                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
                  {books.map((book) => {
                    return <BookShelfView key={book?.book?.id} book={book} />;
                  })}
                </div>
              ) : selectedView === viewOptions[3] ? (
                <div className="mt-4">
                  <BookSpinesView books={books} />
                </div>
              ) : (
                <div className="flex flex-col gap-12">
                  {books.map((book) => {
                    return <BookCrazyView key={book?.book?.id} book={book} />;
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
