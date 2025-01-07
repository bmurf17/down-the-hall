import { getBooksByIsbn } from "@/actions/hardcoverActions";
import { searchBooks } from "@/actions/openLibraryActions";
import Find from "@/components/find/Find";
import BookListItem from "@/components/shared/BookListItem";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { Book } from "@/types/book";
import { TrendingData } from "@/types/trending/trendingbookresponse";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

interface Props {
  searchParams?: { title?: string };
}

async function BookResults({ searchTitle }: { searchTitle: string }) {
  try {
    const openLibraryBooks = await searchBooks(searchTitle);

    const isbn13Regex = /\b97[89]-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d\b/;
    const allValidIsbns: string[] = Array.from(
      new Set(
        openLibraryBooks?.flatMap(
          (x) => x?.isbn?.filter((isbn) => isbn13Regex.test(isbn)) || []
        )
      )
    );

    let convertedData: Book[] = [];
    if (allValidIsbns !== null) {
      const hardcoverBooks: TrendingData | null = await getBooksByIsbn(
        allValidIsbns || []
      );

      if (hardcoverBooks !== null) {
        convertedData = await convertTrendingBookData(
          hardcoverBooks.bookData,
          hardcoverBooks.seriesData
        );
      }
    }

    if (convertedData.length === 0 && searchTitle) {
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

    return (
      <div className="flex flex-col gap-4">
        {convertedData.length > 0 && (
          <div className="rounded-xl bg-gray-300 p-3 animate-fade-in-grow ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
            {convertedData.map((book) => (
              <BookListItem book={book} key={book.book?.hardcoverId} />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.log(error);
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
