import { OpenLibraryBook } from "@/actions/openLibraryActions";
import { Book } from "@/types/book";

export function convertOpenLibraryBookData(openlibraryBook: OpenLibraryBook) {
  const authorName = openlibraryBook?.author_name?.[0] ?? "";

  var returnValue: Book = {
    book: {
      id: 0,
      image: `https://covers.openlibrary.org/b/id/${openlibraryBook.cover_i}-L.jpg`,
      userId: null,
      title: openlibraryBook.title,
      authorId: null,
      status: null,
      releaseYear: openlibraryBook.first_publish_year || 0,
      defaultPhysicalEditionId: 0,
      description: openlibraryBook.description || "",
      seriesPosition: null,
      seriesLength: null,
      seriesName: "",
      pageCount: openlibraryBook.page_count || 0,
      genres: openlibraryBook.genres || [],
      hardcoverId: null,
      dateRead: null,
      updatedDate: null,
      rating: null,
    },
    author: {
      name: authorName,
      id: 0,
      image: null,
    },
    book_notes: null,
  };

  return returnValue;
}
