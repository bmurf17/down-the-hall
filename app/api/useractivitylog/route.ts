import { asc, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../lib/db";
import { author, book, userActivityLog } from "../../../lib/schema";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  const data = await db
    .select({
      userActivity: userActivityLog,
      bookDetails: book,
      authorDetails: author,
    })
    .from(userActivityLog)
    .innerJoin(book, eq(userActivityLog.bookId, book.id))
    .leftJoin(author, eq(book.authorId, author.id))
    .where(eq(userActivityLog.userId, userId || ""))
    .orderBy(desc(userActivityLog.updatedDate));

  return NextResponse.json(data);
}
