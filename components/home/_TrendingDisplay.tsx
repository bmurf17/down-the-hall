import { Book } from "@/types/book";
import BookListItem from "../shared/BookListItem";

interface Props {
  books: Book[];
}

export default function TrendingDisplay({ books }: Props) {
  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">
          No Trending Books Available
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          We are having trouble loading trending books right now. Please try
          refreshing the page or check back later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {books
        .map((book, index) => {
          if (!book || !book.book?.hardcoverId) {
            console.warn(`Invalid book data at index ${index}:`, book);
            return null;
          }

          return <BookListItem book={book} key={book.book.hardcoverId} />;
        })
        .filter(Boolean)}
    </div>
  );
}
