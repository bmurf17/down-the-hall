import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  HARDCOVER_OAUTH_COOKIE_PATH,
  HARDCOVER_OAUTH_REDIRECT_COOKIE,
  HARDCOVER_OAUTH_STATE_COOKIE,
  HARDCOVER_OAUTH_VERIFIER_COOKIE,
  buildHardcoverAuthorizationUrl,
  createHardcoverPkcePair,
  createHardcoverState,
  getHardcoverRedirectUri,
  isHardcoverOAuthConfigured,
  isHardcoverOwner,
} from "@/lib/hardcover-oauth";

export const dynamic = "force-dynamic";

function settingsRedirect(request: NextRequest, result: string) {
  return NextResponse.redirect(
    new URL(`/settings?hardcover=${result}`, request.url)
  );
}

export async function GET(request: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return settingsRedirect(request, "signed-out");
  }

  if (!isHardcoverOwner(userId)) {
    return settingsRedirect(request, "forbidden");
  }

  if (!isHardcoverOAuthConfigured()) {
    return settingsRedirect(request, "not-configured");
  }

  const state = createHardcoverState();
  const { verifier, challenge } = createHardcoverPkcePair();
  const redirectUri = getHardcoverRedirectUri(request.nextUrl.origin);

  const authorizationUrl = await buildHardcoverAuthorizationUrl({
    state,
    codeChallenge: challenge,
    redirectUri,
  });

  const response = NextResponse.redirect(authorizationUrl);
  const secure = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: HARDCOVER_OAUTH_COOKIE_PATH,
    maxAge: 10 * 60,
  };

  response.cookies.set(HARDCOVER_OAUTH_STATE_COOKIE, state, cookieOptions);
  response.cookies.set(
    HARDCOVER_OAUTH_VERIFIER_COOKIE,
    verifier,
    cookieOptions
  );
  response.cookies.set(
    HARDCOVER_OAUTH_REDIRECT_COOKIE,
    redirectUri,
    cookieOptions
  );

  return response;
}
