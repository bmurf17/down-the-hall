import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { users, book } from "@/lib/schema";
import { Status } from "@/types/enums/statusEnum";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    const headers = new Headers({
      "Cache-Control": "no-store, must-revalidate",
      Pragma: "no-cache",
    });

    const data = await db
      .select({
        user: {
          id: users.id,
          userName: users.userName,
          image: users.image,
          lastLoggedIn: users.lastLoggedIn,
        },
        books: {
          id: book.id,
          title: book.title,
          image: book.image,
          dateRead: book.dateRead,
          rating: book.rating,
        },
      })
      .from(users)
      .where(eq(users.id, userId))
      .leftJoin(
        book,
        and(eq(book.userId, users.id), eq(book.status, Status.InProgress))
      );

    // If no user is found
    if (data.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers }
      );
    }

    // Process the data similar to the all users route
    const processedData = {
      user: data[0].user,
      books: data.filter((row) => row.books?.id).map((row) => row.books),
    };

    return NextResponse.json(processedData, { headers });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
