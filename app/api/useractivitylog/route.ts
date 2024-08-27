import { asc, eq } from "drizzle-orm";
import db from "../../../lib/db";
import { book, userActivityLog } from "../../../lib/schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  // Convert userId to a number safely, handling the case where it might be null or invalid
  const userIdNumber = parseInt(userId || "0");

  // Perform the query, joining userActivityLog with the book table
  const data = await db
    .select()
    .from(userActivityLog)
    .innerJoin(book, eq(userActivityLog.bookId, book.id)) // Corrected: Join userActivityLog with the book table
    .where(eq(userActivityLog.userId, userIdNumber)) // Use userId in the WHERE clause
    .orderBy(userActivityLog.updatedDate);

  return NextResponse.json(data);
}
