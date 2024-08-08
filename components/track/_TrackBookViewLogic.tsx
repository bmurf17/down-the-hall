import { Book } from "@/types/book";
import BookCardView from "./_BookCardView";
import BookListView from "./_BookListView";
import BookShelfView from "./_BookShelfView";

interface Props {
  books: Book[];
  selectedView: string | undefined;
  viewOptions: string[];
}

export default function TrackBookViewLogic({
  books,
  selectedView,
  viewOptions,
}: Props) {
  return (
    <div className="mt-4">
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
              {books.map((book) => {
                return <BookListView key={book?.book?.id} book={book} />;
              })}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {books.map((book) => {
                return <BookShelfView key={book?.book?.id} book={book} />;
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
