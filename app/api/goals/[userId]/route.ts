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

export async function OPTIONS(): Promise<NextResponse> {
  const response = NextResponse.json({}, { status: 200 });
  return addCorsHeaders(response);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  const { userId } = params;

  // Get the start of the current year
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);

  const data = await db
    .select({
      bookId: book.id,
      title: book.title,
      dateRead: book.dateRead,
      pageCount: book.pageCount,
      image: book.image,
    })
    .from(book)
    .where(
      sql`${book.userId} = ${userId}
        AND ${book.dateRead} >= ${startOfYear}
        AND ${book.dateRead} IS NOT NULL
        AND ${book.status} = ${Status.Finished}`
    )
    .orderBy(book.dateRead);

  const response = NextResponse.json(data);
  return addCorsHeaders(response);
}
