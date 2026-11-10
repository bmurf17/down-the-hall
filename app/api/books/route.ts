import { NextRequest, NextResponse } from "next/server";

import { getBooksPage } from "@/lib/queries/books";

export async function GET(request: NextRequest) {
  // Intentionally public read-only data: the track page and user profiles are
  // viewable by other readers. Book notes live behind the authenticated
  // /api/books/[userId]/[bookId] route instead.
  const status = request.nextUrl.searchParams.get("status");
  const userId = request.nextUrl.searchParams.get("user");
  const order = request.nextUrl.searchParams.get("order");
  const isDesc = request.nextUrl.searchParams.get("desc") === "true";
  const pageParam = Number.parseInt(
    request.nextUrl.searchParams.get("page") || "1",
    10
  );
  const pageSizeParam = Number.parseInt(
    request.nextUrl.searchParams.get("pageSize") || "25",
    10
  );
  const page = Number.isFinite(pageParam) ? pageParam : 1;
  const pageSize = Number.isFinite(pageSizeParam) ? pageSizeParam : 25;

  try {
    const data = await getBooksPage({
      userId: userId || "",
      status,
      order,
      isDesc,
      page,
      pageSize,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}
