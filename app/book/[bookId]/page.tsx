import { getBook } from "@/actions/hardcoverActions";
import BookDetails from "@/components/bookDetails/BookDetails";
import { processBookSeriesDetails } from "@/helpers/convertSeriesBook";
import { processTrendingBookDetails } from "@/helpers/convertTrendingBookToBook";
import { BookSeriesArray } from "@/types/apiResponse/seriesResponse";
import { Book } from "@/types/book";
import { currentUser } from "@clerk/nextjs/server";

async function getBookData(bookId: string): Promise<Book | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const userRightNow = await currentUser();
  const res = await fetch(
    `${baseUrl}/api/books/${userRightNow?.id}/${bookId}`,
    {
      next: { tags: ["userBook" + bookId] },
    }
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Page({ params }: { params: { bookId: string } }) {
  const data: any = await getBook(params.bookId);

  const hardCoverBookInfo = await processTrendingBookDetails(
    data?.booksData.books_by_pk,
    data.seriesData
  );

  const dbBookData = await getBookData(params.bookId);

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
        dbBookInfo={dbBookData}
        hcSeriesData={seriesData}
        seriesBooks={seriesBooks}
      />
    </div>
  );
}
