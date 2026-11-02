import { and, asc, count, desc, eq, SQL } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

import db from "@/lib/db";
import {
  author,
  book,
  bookNote,
  userActivityLog,
  SelectAuthor,
  SelectBook,
} from "@/lib/schema";

export interface BooksPageOptions {
  userId: string;
  status?: string | null;
  order?: string | null;
  isDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface BooksPage {
  books: {
    book: SelectBook | null;
    author: SelectAuthor | null;
  }[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function getOrderColumn(order: string): PgColumn {
  switch (order.toLowerCase()) {
    case "booklength":
      return book.pageCount;
    case "updateddate":
    case "updatedate":
      return book.updatedDate;
    case "booktitle":
      return book.title;
    case "author":
      return author.name;
    default:
      return book.updatedDate;
  }
}

/**
 * Paginated books for a single reader. Shared by the track page and
 * `/api/books` so both always apply the same filters and ordering.
 */
export async function getBooksPage({
  userId,
  status,
  order,
  isDesc = false,
  page = 1,
  pageSize = 25,
}: BooksPageOptions): Promise<BooksPage> {
  const validatedPage = Math.max(1, page);
  const validatedPageSize = Math.min(Math.max(1, pageSize), 100);
  const offset = (validatedPage - 1) * validatedPageSize;

  const conditions: SQL[] = [eq(book.userId, userId)];

  if (status && status.length > 0 && !Number.isNaN(+status)) {
    conditions.push(eq(book.status, +status));
  }

  const orderColumn = getOrderColumn(order || "");
  const orderDirection = isDesc ? desc : asc;

  const [countResult] = await db
    .select({ count: count() })
    .from(book)
    .where(and(...conditions));

  const totalCount = countResult?.count || 0;

  const books = await db
    .select()
    .from(book)
    .leftJoin(author, eq(book.authorId, author.id))
    .where(and(...conditions))
    .orderBy(orderDirection(orderColumn))
    .limit(validatedPageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / validatedPageSize);

  return {
    books,
    totalCount,
    currentPage: validatedPage,
    totalPages,
    pageSize: validatedPageSize,
    hasNextPage: validatedPage < totalPages,
    hasPreviousPage: validatedPage > 1,
  };
}

/**
 * A reader's copy of a book plus their private notes. Returns null when the
 * signed-in user has not added the book.
 */
export async function getBookForUser(
  userId: string | undefined,
  hardcoverId: number
) {
  if (!userId) {
    return null;
  }

  const [row] = await db
    .select({ book, author })
    .from(book)
    .leftJoin(author, eq(book.authorId, author.id))
    .where(and(eq(book.hardcoverId, hardcoverId), eq(book.userId, userId)))
    .limit(1);

  if (!row) {
    return null;
  }

  const notes = await db
    .select()
    .from(bookNote)
    .where(and(eq(bookNote.bookId, row.book.id), eq(bookNote.userId, userId)));

  return {
    book: row.book,
    author: row.author,
    book_notes: notes,
  };
}

/** Status-change feed shown on the home page. */
export async function getUserActivityLog(userId: string) {
  return db
    .select({
      userActivity: userActivityLog,
      bookDetails: book,
      authorDetails: author,
    })
    .from(userActivityLog)
    .innerJoin(book, eq(userActivityLog.bookId, book.id))
    .leftJoin(author, eq(book.authorId, author.id))
    .where(eq(userActivityLog.userId, userId))
    .orderBy(desc(userActivityLog.updatedDate));
}
