import { eq, sql } from "drizzle-orm";

import db from "@/lib/db";
import { book, userGoals, SelectBook, SelectGoal } from "@/lib/schema";
import { Status } from "@/types/enums/statusEnum";

export interface UserGoalsData {
  books: SelectBook[];
  goals: SelectGoal[];
}

/** Books finished this year plus the reader's goal rows. */
export async function getUserGoals(userId: string): Promise<UserGoalsData> {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);

  const books = await db
    .select()
    .from(book)
    .where(
      sql`${book.userId} = ${userId}
        AND ${book.dateRead} >= ${startOfYear}
        AND ${book.dateRead} IS NOT NULL
        AND ${book.status} = ${Status.Finished}`
    )
    .orderBy(book.dateRead);

  const goals = await db
    .select()
    .from(userGoals)
    .where(eq(userGoals.userId, userId));

  return { books, goals };
}
