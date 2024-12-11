import { Book } from "@/types/book";
import BookCardView from "./_BookCardView";
import BookListView from "./_BookListView";
import BookShelfView from "./_BookShelfView";
import BookCrazyView from "./_BookCrazyView";

interface Props {
  books: Book[];
  selectedView: string | undefined;
  viewOptions: string[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function TrackBookViewLogic({
  books,
  selectedView,
  viewOptions,
}: Props) {
  return (
    <div
      className={classNames(
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
            <div className="flex flex-col gap-2">
              <BookListView books={books} />
            </div>
          ) : (
            <>
              {selectedView === viewOptions[2] ? (
                <div className="mt-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {books.map((book) => {
                    return <BookShelfView key={book?.book?.id} book={book} />;
                  })}
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
