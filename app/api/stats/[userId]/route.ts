import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../lib/db";
import { book } from "../../../../lib/schema";
import { headers } from "next/headers";

function addCorsHeaders(response: NextResponse) {
  const origin = headers().get("origin") || "*";

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export async function OPTIONS(): Promise<NextResponse> {
  // Return a 200 response with CORS headers for preflight requests
  const response = NextResponse.json({}, { status: 200 });
  return addCorsHeaders(response);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  const { userId } = params;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

  const data = await db
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

  const response = NextResponse.json(data);
  return addCorsHeaders(response);
}
