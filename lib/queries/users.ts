import { and, eq } from "drizzle-orm";

import db from "@/lib/db";
import { book, users } from "@/lib/schema";
import { Status } from "@/types/enums/statusEnum";
import { userGridResponse } from "@/types/apiResponse/usersgridResponse";

function baseQuery() {
  return db
    .select({
      user: {
        id: users.id,
        userName: users.userName,
        image: users.image,
        lastLoggedIn: users.lastLoggedIn,
      },
      books: {
        id: book.id,
        title: book.title,
        image: book.image,
        dateRead: book.dateRead,
        rating: book.rating,
        pageCount: book.pageCount,
      },
    })
    .from(users)
    .leftJoin(
      book,
      and(eq(book.userId, users.id), eq(book.status, Status.InProgress))
    );
}

type UserRow = {
  user: userGridResponse["user"];
  books: userGridResponse["books"][number] | null;
};

function groupByUser(rows: UserRow[]): userGridResponse[] {
  const byUser = new Map<string, userGridResponse>();

  for (const row of rows) {
    let entry = byUser.get(row.user.id);

    if (!entry) {
      entry = { user: row.user, books: [] };
      byUser.set(row.user.id, entry);
    }

    if (row.books?.id) {
      entry.books.push(row.books);
    }
  }

  return Array.from(byUser.values());
}

/** Every reader and the book they are currently reading. */
export async function getUsersWithCurrentlyReading(): Promise<
  userGridResponse[]
> {
  return groupByUser(await baseQuery());
}

/** A single reader and the books they are currently reading. */
export async function getUserWithCurrentlyReading(
  userId: string
): Promise<userGridResponse | null> {
  const rows = await baseQuery().where(eq(users.id, userId));

  if (rows.length === 0) {
    return null;
  }

  return groupByUser(rows)[0] ?? null;
}
