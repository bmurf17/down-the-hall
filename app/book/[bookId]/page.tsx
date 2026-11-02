import { getBook } from "@/actions/hardcoverActions";
import BookDetails from "@/components/bookDetails/BookDetails";
import { processBookSeriesDetails } from "@/helpers/convertSeriesBook";
import { processTrendingBookDetails } from "@/helpers/convertTrendingBookToBook";
import { BookSeriesArray } from "@/types/apiResponse/seriesResponse";
import { Book } from "@/types/book";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getBookForUser } from "@/lib/queries/books";

export default async function Page({ params }: { params: { bookId: string } }) {
  const data: any = await getBook(params.bookId);

  if (!data?.booksData?.books_by_pk) {
    notFound();
  }

  const userRightNow = await currentUser();

  const [hardCoverBookInfo, dbBookData] = await Promise.all([
    processTrendingBookDetails(data?.booksData.books_by_pk, data.seriesData),
    getBookForUser(userRightNow?.id, parseInt(params.bookId, 10)),
  ]);

  const seriesData: BookSeriesArray = data.seriesData;

  const seriesBooks = Array.isArray(seriesData)
    ? await Promise.all(
        seriesData.map((series) =>
          processBookSeriesDetails(series, series.book.id)
        )
      )
    : [];

  return (
    <div className="mx-16">
      <BookDetails
        hardCoverBookInfo={hardCoverBookInfo}
        dbBookInfo={dbBookData as Book | null}
        hcSeriesData={seriesData}
        seriesBooks={seriesBooks}
      />
    </div>
  );
}
