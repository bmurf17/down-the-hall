import PageShell from "@/components/shared/Page";
import Track from "@/components/track/Track";
import { currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import Loading from "../loading";
import { getBooksPage, BooksPage } from "@/lib/queries/books";

interface Props {
  searchParams?: {
    status?: string;
    order?: string;
    page?: string;
    pageSize?: string;
    desc?: string;
  };
}

async function getBookData(
  status?: string,
  order?: string,
  page?: string,
  pageSize?: string,
  desc?: string
): Promise<BooksPage> {
  const userRightNow = await currentUser();

  return getBooksPage({
    userId: userRightNow?.id ?? "",
    status,
    order,
    isDesc: desc === "true",
    page: page ? parseInt(page) : 1,
    pageSize: pageSize ? parseInt(pageSize) : 25,
  });
}

export default async function TrackPage({ searchParams }: Props) {
  const booksPromise = getBookData(
    searchParams?.status,
    searchParams?.order,
    searchParams?.page,
    searchParams?.pageSize,
    searchParams?.desc
  );

  return (
    <PageShell>
      <Suspense fallback={<Loading />}>
        <AsyncTrack booksPromise={booksPromise} />
      </Suspense>
    </PageShell>
  );
}

async function AsyncTrack({
  booksPromise,
}: {
  booksPromise: Promise<BooksPage>;
}) {
  const data = await booksPromise;
  return <Track books={data.books} totalCount={data.totalCount} />;
}
