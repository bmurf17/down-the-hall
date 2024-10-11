import Track from "@/components/track/Track";
import { Book } from "@/types/book";
import { currentUser } from "@clerk/nextjs/server";

interface Props {
  searchParams?: { status?: string; order?: string };
}

async function getBookData(status?: string, order?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const userRightNow = await currentUser();
  const res = await fetch(
    `${baseUrl}/api/books?status=${status}&user=${userRightNow?.id}&order=${order}`,
    {
      next: { tags: ["books"] },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function TrackPage({ searchParams }: Props) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return null;
  }

  const books: Book[] = await getBookData(
    searchParams?.status,
    searchParams?.order
  );
  return (
    <div className="mx-16">
      <Track books={books} />
    </div>
  );
}
