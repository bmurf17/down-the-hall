import { NextRequest, NextResponse } from "next/server";

import { book, author, bookNote } from "@/lib/schema"; // adjust this import based on your project structure
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
    const bookData = await db
      .select()
      .from(book)
      .where(eq(book.hardcoverId, parseInt(bookId)));

    const data = await db
      .select()
      .from(book)
      .innerJoin(author, eq(book.authorId, author.id))
      .leftJoin(bookNote, eq(book.id, bookNote.bookId))
      .where(and(eq(book.userId, userId), eq(book.id, bookData[0].id)));

    if (data.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const result = {
      book: data[0].book,
      author: data[0].author,
      book_notes: data.map((entry) => entry.book_note).filter(Boolean),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
