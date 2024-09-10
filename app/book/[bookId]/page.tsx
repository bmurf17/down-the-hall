import { getBook } from "@/actions/hardcoverActions";
import BookDetails from "@/components/bookDetails/BookDetails";
import { processTrendingBookDetails } from "@/helpers/convertTrendingBookToBook";
import { HardCoverApiResponse } from "@/types/hardcoverresponse";

export default async function Page({ params }: { params: { bookId: string } }) {
  const data2: any = await getBook(params.bookId);

  const bookData = await processTrendingBookDetails(
    data2.booksData.books_by_pk,
    data2.seriesData
  );
  return (
    <div className="mx-16">
      <BookDetails bookInfo={bookData} />
    </div>
  );
}
