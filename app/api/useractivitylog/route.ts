import { asc, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../lib/db";
import { author, book, userActivityLog } from "../../../lib/schema";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  // Convert userId to a number safely, handling the case where it might be null or invali
  const data = await db
    .select({
      userActivity: userActivityLog, // Selecting userActivityLog fields
      bookDetails: book, // Selecting book fields
      authorDetails: author, // Selecting author fields
    })
    .from(userActivityLog)
    .innerJoin(book, eq(userActivityLog.bookId, book.id)) // Join userActivityLog with the book table
    .leftJoin(author, eq(book.authorId, author.id)) // Left join in case author is missing
    .where(eq(userActivityLog.userId, userId || ""))
    .orderBy(desc(userActivityLog.updatedDate));

  return NextResponse.json(data);
}
