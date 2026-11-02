import { Book } from "@/types/book";
import BookListItem from "../shared/BookListItem";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  books: Book[];
}

export default function TrendingDisplay({ books }: Props) {
  const router = useRouter();

  if (!books || books.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-col items-center px-4 py-10 text-center"
      >
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          <BookOpen className="size-7 text-muted-foreground" aria-hidden />
        </div>
        <h3 className="mb-1 text-lg font-medium">
          No trending books right now
        </h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          We couldn't load trending books. Try again in a moment.
        </p>
        <Button className="mt-4 min-h-11" onClick={() => router.refresh()}>
          Try again
        </Button>
      </div>
    );
  }
  const validBooks = books.filter((b) => b?.book?.hardcoverId);

  return (
    <div className="flex flex-col gap-3">
      {validBooks.map((book) => (
        <BookListItem key={book.book?.hardcoverId} book={book} />
      ))}
    </div>
  );
}
