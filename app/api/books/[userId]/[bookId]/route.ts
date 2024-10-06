import { NextRequest, NextResponse } from "next/server";

import { book, author } from "@/lib/schema"; // adjust this import based on your project structure
import { eq, and } from "drizzle-orm";
import db from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; bookId: string } }
): Promise<NextResponse> {
  const { userId, bookId } = params;

  if (!userId || !bookId) {
    return NextResponse.json(
      { error: "User ID and Book ID are required" },
      { status: 400 }
    );
  }

  try {
    const data = await db
      .select()
      .from(book)
      .innerJoin(author, eq(book.authorId, author.id))
      .where(
        and(eq(book.userId, userId), eq(book.hardcoverId, parseInt(bookId)))
      )
      .limit(1);

    if (data.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
