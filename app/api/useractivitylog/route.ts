import { NextRequest, NextResponse } from "next/server";

import { getUserActivityLog } from "@/lib/queries/books";

export async function GET(request: NextRequest) {
  // Intentionally public read-only activity feed (status changes on public
  // books). It never includes book notes.
  const userId = request.nextUrl.searchParams.get("userId");

  const data = await getUserActivityLog(userId || "");

  return NextResponse.json(data);
}
