import { SelectBook, SelectAuthor } from "@/lib/schema";
import { BookSeries } from "@/types/apiResponse/seriesResponse";
import { Book } from "@/types/book";
import { handleImage } from "./convertTrendingBookToBook";

export const processBookSeriesDetails = async (
  bookSeries: BookSeries,
  bookId: number
): Promise<Book> => {
  const dtoCombined = bookSeries.book;

  var image = await handleImage(
    bookId,
    dtoCombined.title,
    bookSeries.book?.cached_image.url || "placeholder.png"
  );

  var authorId = dtoCombined.contributions
    ? dtoCombined.contributions?.length > 0
      ? dtoCombined.contributions[0]?.author?.id || 0
      : 0
    : 0;

  const book: SelectBook = {
    id: bookId,
    title: dtoCombined.title,
    authorId: authorId,
    image: image,
    status: null,
    releaseYear: dtoCombined.release_year,
    defaultPhysicalEditionId: 0,
    description: dtoCombined.description,
    seriesPosition: bookSeries.position?.toString() || null,
    seriesLength: dtoCombined.series?.length || null,
    seriesName: "",
    hardcoverId: 0,
    pageCount: dtoCombined.page_count,
    genres: dtoCombined.genres,
    dateRead: Date.now().toString(),
    updatedDate: Date.now().toString(),
    userId: "",
    rating: "0",
  };

  const author: SelectAuthor = {
    id: authorId,
    name: "",
    image: "",
  };

  const returnBook: Book = {
    author: author,
    book: book,
    book_notes: null,
  };

  return returnBook;
};
