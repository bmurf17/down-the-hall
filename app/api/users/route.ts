// app/api/users/route.ts
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { users, book } from "@/lib/schema";
import { Status } from "@/types/enums/statusEnum";

// app/api/users/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {  
  try {
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
      .leftJoin(
        book,
        and(eq(book.userId, users.id), eq(book.status, Status.InProgress))
      );

    const processedData = data.reduce<Record<string, any>>((acc, row) => {
      if (!acc[row.user.id]) {
        acc[row.user.id] = {
          user: row.user,
          books: [],
        };
      }

      if (row.books?.id) {
        acc[row.books.id].books.push(row.books);
      }

      return acc;
    }, {});

    const finalData = Object.values(processedData);

    return NextResponse.json(finalData);
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