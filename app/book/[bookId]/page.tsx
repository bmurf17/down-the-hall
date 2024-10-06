import { getBook } from "@/actions/hardcoverActions";
import BookDetails from "@/components/bookDetails/BookDetails";
import { processTrendingBookDetails } from "@/helpers/convertTrendingBookToBook";
import { Book } from "@/types/book";
import { currentUser } from "@clerk/nextjs/server";

async function getBookData(bookId: string): Promise<Book> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const userRightNow = await currentUser();
  console.log(`${baseUrl}/api/books${userRightNow?.id}/${bookId}`);
  const res = await fetch(
    `${baseUrl}/api/books/${userRightNow?.id}/${bookId}`,
    {
      next: { tags: ["userBook" + bookId] },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Page({ params }: { params: { bookId: string } }) {
  const data: any = await getBook(params.bookId);

  const hardCoverBookInfo = await processTrendingBookDetails(
    data.booksData.books_by_pk,
    data.seriesData
  );

  const dbBookData = await getBookData(params.bookId);

  return (
    <div className="mx-16">
      <BookDetails
        hardCoverBookInfo={hardCoverBookInfo}
        dbBookInfo={dbBookData}
      />
    </div>
  );
}
