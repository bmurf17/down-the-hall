import { getGoogleBooks } from "@/actions/googleBookActions";
import { getBooks } from "@/actions/hardcoverActions";
import Find from "@/components/find/Find";
import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { Book } from "@/types/book";
import { GoogleBooksResponse } from "@/types/googlebookresponse";
import { HardCoverApiResponse } from "@/types/hardcoverresponse";
import { TrendingData } from "@/types/trending/trendingbookresponse";

interface Props {
  searchParams?: { title?: string };
}

export default async function FindPage({ searchParams }: Props) {
  const searchTitle = searchParams?.title || "";

  const hardcoverBooks: TrendingData | null = await getBooks(searchTitle);
  var convertedData: Book[] = [];

  if (hardcoverBooks !== null) {
    convertedData = await convertTrendingBookData(
      hardcoverBooks.bookData,
      hardcoverBooks.authorData,
      hardcoverBooks.imageData,
      hardcoverBooks.seriesData
    );
  }

  return (
    <div className="mx-16">
      <Find books={convertedData} />
    </div>
  );
}
