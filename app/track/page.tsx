import Track from "@/components/track/Track";
import { Book } from "@/types/book";
import { currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import Loading from "../loading";

interface Props {
  searchParams?: {
    status?: string;
    order?: string;
    page?: string;
    pageSize?: string;
    desc?: string;
  };
}

interface PaginatedResponse {
  books: Book[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

async function getBookData(
  status?: string,
  order?: string,
  page?: string,
  pageSize?: string,
  desc?: string
): Promise<PaginatedResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const userRightNow = await currentUser();

  const searchParams = new URLSearchParams({
    ...(status && { status }),
    ...(userRightNow?.id && { user: userRightNow.id }),
    ...(order && { order }),
    ...(page && { page }),
    ...(pageSize && { pageSize }),
    ...(desc && { desc }),
  });

  const res = await fetch(`${baseUrl}/api/books?${searchParams.toString()}`, {
    next: { tags: ["books"] },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function TrackPage({ searchParams }: Props) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return null;
  }

  const booksPromise = getBookData(
    searchParams?.status,
    searchParams?.order,
    searchParams?.page,
    searchParams?.pageSize,
    searchParams?.desc
  );

  return (
    <div className="mx-16">
      <Suspense fallback={<Loading />}>
        <AsyncTrack booksPromise={booksPromise} />
      </Suspense>
    </div>
  );
}

async function AsyncTrack({
  booksPromise,
}: {
  booksPromise: Promise<PaginatedResponse>;
}) {
  const data = await booksPromise;
  return <Track books={data.books} totalCount={data.totalCount} />;
}
