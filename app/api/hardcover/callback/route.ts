import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  HARDCOVER_ISSUER,
  HARDCOVER_OAUTH_COOKIE_PATH,
  HARDCOVER_OAUTH_REDIRECT_COOKIE,
  HARDCOVER_OAUTH_STATE_COOKIE,
  HARDCOVER_OAUTH_VERIFIER_COOKIE,
  HardcoverOAuthError,
  completeHardcoverAuthorization,
  isHardcoverOAuthConfigured,
  isHardcoverOwner,
  safeStateEqual,
} from "@/lib/hardcover-oauth";

export const dynamic = "force-dynamic";

const OAUTH_COOKIES = [
  HARDCOVER_OAUTH_STATE_COOKIE,
  HARDCOVER_OAUTH_VERIFIER_COOKIE,
  HARDCOVER_OAUTH_REDIRECT_COOKIE,
];

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

  const response = NextResponse.redirect(url);

  // These cookies are single-use, whether the flow succeeded or not.
  for (const name of OAUTH_COOKIES) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: HARDCOVER_OAUTH_COOKIE_PATH,
      maxAge: 0,
    });
  }

  return response;
}

export async function GET(request: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return redirectWithResult(request, "signed-out");
  }

  if (!isHardcoverOwner(userId)) {
    return redirectWithResult(request, "forbidden");
  }

  if (!isHardcoverOAuthConfigured()) {
    return redirectWithResult(request, "not-configured");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const issuer = request.nextUrl.searchParams.get("iss");
  const error = request.nextUrl.searchParams.get("error");
  const expectedState = request.cookies.get(
    HARDCOVER_OAUTH_STATE_COOKIE
  )?.value;
  const verifier = request.cookies.get(
    HARDCOVER_OAUTH_VERIFIER_COOKIE
  )?.value;
  const redirectUri = request.cookies.get(
    HARDCOVER_OAUTH_REDIRECT_COOKIE
  )?.value;

  if (!state || !expectedState || !safeStateEqual(expectedState, state)) {
    return redirectWithResult(
      request,
      "error",
      "The Hardcover callback did not match this browser session. Try connecting again."
    );
  }

  // Verify state before showing a denial so a forged callback can't cancel a
  // real in-progress connection.
  if (error) {
    return redirectWithResult(
      request,
      "denied",
      request.nextUrl.searchParams.get("error_description") || error
    );
  }

  if (!code) {
    return redirectWithResult(
      request,
      "error",
      "Hardcover did not return an authorization code."
    );
  }

  if (issuer !== HARDCOVER_ISSUER) {
    return redirectWithResult(
      request,
      "error",
      "The Hardcover callback came from an unexpected issuer."
    );
  }

  if (!verifier || !redirectUri) {
    return redirectWithResult(
      request,
      "error",
      "The PKCE verifier expired. Try connecting again."
    );
  }

  try {
    await completeHardcoverAuthorization({
      code,
      codeVerifier: verifier,
      redirectUri,
    });
  } catch (error) {
    console.error("Hardcover OAuth token exchange failed.", error);

    const reason =
      error instanceof HardcoverOAuthError
        ? error.message
        : "Could not exchange the Hardcover authorization code.";

    return redirectWithResult(request, "error", reason);
  }

  return redirectWithResult(request, "connected");
}
