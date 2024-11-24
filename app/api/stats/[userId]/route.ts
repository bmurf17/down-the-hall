import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../lib/db";
import { author, book, userActivityLog } from "../../../../lib/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  const { userId } = params;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Get last 6 months including current

  var data = await db
    .select({
      month: sql<string>`to_char(${book.dateRead}, 'YYYY-MM')`,
      totalPages: sql<number>`sum(${book.pageCount})`,
      bookCount: sql<number>`count(*)`,
    })
    .from(book)
    .where(
      sql`${book.userId} = ${userId} 
        AND ${book.dateRead} >= ${sixMonthsAgo}
        AND ${book.dateRead} IS NOT NULL
        AND ${book.pageCount} IS NOT NULL`
    )
    .groupBy(sql`to_char(${book.dateRead}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${book.dateRead}, 'YYYY-MM')`);

  return NextResponse.json(data);
}
