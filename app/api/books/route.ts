import { asc, desc, eq, and, SQL } from "drizzle-orm";
import db from "../../../lib/db";
import { author, book } from "../../../lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { PgColumn } from "drizzle-orm/pg-core";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const userId = request.nextUrl.searchParams.get("user");
  const order = request.nextUrl.searchParams.get("order");
  const isDesc = request.nextUrl.searchParams.get("desc") === "true";

  let conditions: SQL[] = [eq(book.userId, userId || "")];

  if (status && status.length > 0 && !Number.isNaN(+status)) {
    conditions.push(eq(book.status, +status));
  }

  const orderColumn = getOrderColumn(order || "");
  const orderDirection = isDesc ? desc : asc;

  let query = db
    .select()
    .from(book)
    .fullJoin(author, eq(book.authorId, author.id))
    .where(and(...conditions))
    .orderBy(orderDirection(orderColumn));

  const data = await query;
  return NextResponse.json(data);
}

function getOrderColumn(order: string): PgColumn {
  switch (order.toLowerCase()) {
    case "booklength":
      return book.pageCount;
    case "updatedate":
      return book.updatedDate;
    case "booktitle":
      return book.title;
    case "author":
      return author.name;
    // Add more cases as needed
    default:
      return book.updatedDate;
  }
}
