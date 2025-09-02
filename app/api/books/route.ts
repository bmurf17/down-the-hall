import { asc, desc, eq, and, SQL, count } from "drizzle-orm";
import db from "../../../lib/db";
import { author, book } from "../../../lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { PgColumn } from "drizzle-orm/pg-core";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const userId = request.nextUrl.searchParams.get("user");
  const order = request.nextUrl.searchParams.get("order");
  const isDesc = request.nextUrl.searchParams.get("desc") === "true";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const pageSize = parseInt(
    request.nextUrl.searchParams.get("pageSize") || "25"
  );

  // Validate pagination parameters
  const validatedPage = Math.max(1, page);
  const validatedPageSize = Math.min(Math.max(1, pageSize), 100); // Cap at 100 items per page
  const offset = (validatedPage - 1) * validatedPageSize;

  let conditions: SQL[] = [eq(book.userId, userId || "")];

  if (status && status.length > 0 && !Number.isNaN(+status)) {
    conditions.push(eq(book.status, +status));
  }

  const orderColumn = getOrderColumn(order || "");
  const orderDirection = isDesc ? asc : desc;

  try {
    const countQuery = db
      .select({ count: count() })
      .from(book)
      .fullJoin(author, eq(book.authorId, author.id))
      .where(and(...conditions));

    const [countResult] = await countQuery;
    const totalCount = countResult?.count || 0;

    const dataQuery = db
      .select()
      .from(book)
      .fullJoin(author, eq(book.authorId, author.id))
      .where(and(...conditions))
      .orderBy(orderDirection(orderColumn))
      .limit(validatedPageSize)
      .offset(offset);

    console.log(orderColumn);

    const books = await dataQuery;

    const totalPages = Math.ceil(totalCount / validatedPageSize);

    const response = {
      books,
      totalCount,
      currentPage: validatedPage,
      totalPages,
      pageSize: validatedPageSize,
      hasNextPage: validatedPage < totalPages,
      hasPreviousPage: validatedPage > 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

function getOrderColumn(order: string): PgColumn {
  switch (order.toLowerCase()) {
    case "booklength":
      return book.pageCount;
    case "updateddate":
    case "updatedate":
      return book.updatedDate;
    case "booktitle":
      return book.title;
    case "author":
      return author.name;
    default:
      return book.updatedDate;
  }
}
