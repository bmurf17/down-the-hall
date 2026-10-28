import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  HardcoverOAuthError,
  disconnectHardcover,
  isHardcoverOwner,
} from "@/lib/hardcover-oauth";

export const dynamic = "force-dynamic";

function redirectWithResult(
  request: NextRequest,
  result: string,
  reason?: string
) {
  const url = new URL("/settings", request.url);
  url.searchParams.set("hardcover", result);
  if (reason) {
    url.searchParams.set("reason", reason.slice(0, 300));
  }

  // 303 so the browser follows up with a GET instead of replaying the POST.
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return redirectWithResult(request, "signed-out");
  }

  if (!isHardcoverOwner(userId)) {
    return redirectWithResult(request, "forbidden");
  }

  try {
    await disconnectHardcover();
  } catch (error) {
    console.error("Could not disconnect Hardcover.", error);

    const reason =
      error instanceof HardcoverOAuthError
        ? error.message
        : "Could not disconnect Hardcover.";

    return redirectWithResult(request, "error", reason);
  }

  return redirectWithResult(request, "disconnected");
}
