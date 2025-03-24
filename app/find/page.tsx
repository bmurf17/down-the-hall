import { enhancedSearchBooks, searchBooks } from "@/actions/openLibraryActions";
import Find from "@/components/find/Find";
import BookListItem from "@/components/shared/BookListItem";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Book } from "@/types/book";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

interface Props {
  searchParams?: { title?: string };
}

async function BookResults({ searchTitle }: { searchTitle: string }) {
  try {
    var convertedData: Book[] | null | undefined = [];

    convertedData = await enhancedSearchBooks({
      title: searchTitle,
      limit: 5,
    });

    if (convertedData?.length === 0 && searchTitle) {
      return (
        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No books found</AlertTitle>
          <AlertDescription>
            We could not find any books matching {searchTitle}. Try adjusting
            your search terms.
          </AlertDescription>
        </Alert>
      );
    }

    if (convertedData != null) {
      return (
        <div className="flex flex-col gap-4">
          {convertedData?.length > 0 && (
            <div className="rounded-xl bg-gray-300 p-3 animate-fade-in-grow ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
              {convertedData
                ?.filter(
                  (book) =>
                    book.book?.image &&
                    book.book.image !== "" &&
                    !book.book.image.toLowerCase().includes("hardcover")
                )
                .map((book) => (
                  <BookListItem book={book} key={book.book?.hardcoverId} />
                ))}
            </div>
          )}
        </div>
      );
    }
  } catch (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch books. Please try again.
        </AlertDescription>
      </Alert>
    );
  }
}

function LoadingResults() {
  return (
    <div className="w-full grid grid-cols-1 gap-6 mt-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex gap-4">
            <div className="bg-gray-200 rounded-lg h-32 w-24" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FindPage({ searchParams }: Props) {
  const searchTitle = searchParams?.title || "";

  return (
    <div className="mx-16">
      <Find>
        <Suspense fallback={<LoadingResults />}>
          {searchTitle && <BookResults searchTitle={searchTitle} />}
        </Suspense>
      </Find>
    </div>
  );
}
