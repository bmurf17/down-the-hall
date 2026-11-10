import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getBookForUser } from "@/lib/queries/books";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; bookId: string } }
): Promise<NextResponse> {
  const { userId, bookId } = params;

  const parsedBookId = Number.parseInt(bookId, 10);

  if (!userId || !Number.isFinite(parsedBookId)) {
    return NextResponse.json(
      { error: "User ID and numeric Book ID are required" },
      { status: 400 }
    );
  }

  // Notes are private. Only the signed-in owner may read this payload, and the
  // URL userId must match the session so it cannot be used to read someone
  // else's notes by guessing an id.
  const { userId: sessionUserId } = auth();
  if (!sessionUserId || sessionUserId !== userId) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  try {
    const data = await getBookForUser(userId, parsedBookId);

    if (!data) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
