import { ScrollArea } from "@/components/ui/scroll-area";
import { Book } from "@/types/book";

interface CompletedBooksListProps {
  books: Book[];
}

export function CompletedBooksList({ books }: CompletedBooksListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Completed Books</h3>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        {books.length > 0 ? (
          <ul className="space-y-2">
            {books.map((book) => (
              <li key={book.book?.id} className="text-sm">
                {book.book?.title} by {book.author?.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No books completed yet.</p>
        )}
      </ScrollArea>
    </div>
  );
}
