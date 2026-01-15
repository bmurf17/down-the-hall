import Users from "@/components/users/Users";
import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import { currentUser } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { users, book } from "@/lib/schema";
import { Status } from "@/types/enums/statusEnum";
import { eq, and } from "drizzle-orm";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UserPage() {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg">User not logged in</p>
        </div>
      );
    }

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
        acc[row.user.id].books.push(row.books);
      }

      return acc;
    }, {});

    const userGridResponse: userGridResponse[] = Object.values(processedData);

    return (
      <div className="mx-16">
        <Users users={userGridResponse} />
      </div>
    );
  } catch (error) {
    console.error("StatsPage Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">
          Error:{" "}
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
      </div>
    );
  }
} 