import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../lib/db";
import { book } from "../../../../lib/schema";
import { Status } from "@/types/enums/statusEnum";

function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  const { userId } = params;

  const startParam = request.nextUrl.searchParams.get("start");
  const endParam = request.nextUrl.searchParams.get("end");

  const defaultStartDate = new Date();
  defaultStartDate.setMonth(defaultStartDate.getMonth() - 6);

  const startDate = startParam ? new Date(startParam) : defaultStartDate;
  const endDate = endParam ? new Date(endParam) : new Date();

  if (startParam && isNaN(startDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid start date format. Use YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  if (endParam && isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid end date format. Use YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  const data = await db
    .select({
      month: sql`to_char(${book.dateRead}, 'YYYY-MM')`,
      totalPages: sql`SUM(${book.pageCount})`,
      bookCount: sql`COUNT(*)`,
    })
    .from(book)
    .where(
      sql`${book.userId} = ${userId}
        AND ${book.dateRead} >= ${startDate.toISOString().split("T")[0]}
        AND ${book.dateRead} <= ${endDate.toISOString().split("T")[0]}
        AND ${book.dateRead} IS NOT NULL
        AND ${book.pageCount} IS NOT NULL 
        AND ${book.status} = ${Status.Finished}`
    )
    .groupBy(sql`to_char(${book.dateRead}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${book.dateRead}, 'YYYY-MM')`);

  const response = NextResponse.json(data);

  // Add no-cache headers
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");

  return addCorsHeaders(response);
}
