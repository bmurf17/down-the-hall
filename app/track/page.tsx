import Track from "@/components/track/Track";
import { Book } from "@/types/book";
import { currentUser } from "@clerk/nextjs/server";

interface Props {
  searchParams?: { status?: string };
}

async function getBookData(status?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const userRightNow = await currentUser();
  const res = await fetch(
    `${baseUrl}/api/books?status=${status}&user=${userRightNow?.id}`,
    {
      next: { tags: ["books"] },
    }
  );
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function TrackPage({ searchParams }: Props) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return null;
  }

  const books: Book[] = await getBookData(searchParams?.status);
  return (
    <div className="mx-16">
      <Track books={books} />
    </div>
  );
}
