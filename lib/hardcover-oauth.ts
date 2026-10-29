import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import db from "@/lib/db";
import {
  hardcoverOAuthToken,
  type SelectHardcoverOAuthToken,
} from "@/lib/schema";

/**
 * Hardcover's OAuth server. The discovery document also publishes these
 * values; we fetch it lazily and fall back to the documented defaults so a
 * discovery outage can't take the whole integration down.
 *
 * https://api.hardcover.app/.well-known/oauth-authorization-server
 */
export const HARDCOVER_ISSUER = "https://api.hardcover.app";
export const HARDCOVER_GRAPHQL_ENDPOINT = "https://api.hardcover.app/v1/graphql";

/**
 * All of the app's queries are catalog reads (books, editions, series,
 * trending), so this is the only scope we request.
 */
export const HARDCOVER_SCOPES = "read:catalog";

export const HARDCOVER_OAUTH_STATE_COOKIE = "hc_oauth_state";
export const HARDCOVER_OAUTH_VERIFIER_COOKIE = "hc_oauth_verifier";
export const HARDCOVER_OAUTH_REDIRECT_COOKIE = "hc_oauth_redirect";
export const HARDCOVER_OAUTH_COOKIE_PATH = "/api/hardcover";

const FALLBACK_ENDPOINTS = {
  authorize: "https://hardcover.app/oauth2/authorize",
  token: "https://api.hardcover.app/oauth2/token",
  revoke: "https://api.hardcover.app/oauth2/revoke",
  issuer: HARDCOVER_ISSUER,
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const EXPIRY_SKEW_MS = 60 * 1000;
const REFRESH_LOCK_MS = 30 * 1000;
const REFRESH_WAIT_MS = 250;
const REFRESH_WAIT_ATTEMPTS = 20;

type HardcoverEndpoints = typeof FALLBACK_ENDPOINTS;

interface HardcoverDiscoveryDocument {
  issuer?: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  revocation_endpoint?: string;
}

export interface HardcoverTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

interface TokenErrorPayload {
  error?: string;
  error_description?: string;
}

export class HardcoverOAuthError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(
    message: string,
    options?: { code?: string; status?: number }
  ) {
    super(message);
    this.name = "HardcoverOAuthError";
    this.code = options?.code;
    this.status = options?.status;
  }
}

export interface HardcoverConnectionStatus {
  configured: boolean;
  connected: boolean;
  patFallback: boolean;
  scope: string | null;
  expiresAt: string | null;
  tokenType: string | null;
  error?: string;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;
let refreshInFlight: Promise<string> | null = null;
let endpointsPromise: Promise<HardcoverEndpoints> | null = null;

function getClientConfig() {
  const clientId = process.env.HARDCOVER_CLIENT_ID?.trim();
  const clientSecret = process.env.HARDCOVER_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new HardcoverOAuthError(
      "Hardcover OAuth is not configured. Set HARDCOVER_CLIENT_ID and HARDCOVER_CLIENT_SECRET."
    );
  }

  return { clientId, clientSecret };
}

export function isHardcoverOAuthConfigured(): boolean {
  return Boolean(
    process.env.HARDCOVER_CLIENT_ID?.trim() &&
      process.env.HARDCOVER_CLIENT_SECRET?.trim()
  );
}

export function isHardcoverOwner(userId: string): boolean {
  const ownerId = process.env.HARDCOVER_OWNER_USER_ID?.trim();
  return !ownerId || ownerId === userId;
}

export function getHardcoverRedirectUri(origin: string): string {
  const configured = process.env.HARDCOVER_REDIRECT_URI?.trim();
  return configured || new URL("/api/hardcover/callback", origin).toString();
}

function getHardcoverPat(): string | null {
  const token = process.env.HARDCOVER_TOKEN?.trim();
  if (!token) {
    return null;
  }

  // Be forgiving if someone already pasted a full "Bearer ..." value.
  return token.replace(/^Bearer\s+/i, "");
}

async function getEndpoints(): Promise<HardcoverEndpoints> {
  if (!endpointsPromise) {
    endpointsPromise = (async () => {
      try {
        const response = await fetch(
          `${HARDCOVER_ISSUER}/.well-known/oauth-authorization-server`,
          {
            headers: { Accept: "application/json" },
            next: { revalidate: 3600 },
          }
        );

        if (!response.ok) {
          return FALLBACK_ENDPOINTS;
        }

        const data = (await response.json()) as HardcoverDiscoveryDocument;
        return {
          authorize:
            data.authorization_endpoint || FALLBACK_ENDPOINTS.authorize,
          token: data.token_endpoint || FALLBACK_ENDPOINTS.token,
          revoke: data.revocation_endpoint || FALLBACK_ENDPOINTS.revoke,
          issuer: data.issuer || FALLBACK_ENDPOINTS.issuer,
        };
      } catch {
        return FALLBACK_ENDPOINTS;
      }
    })();
  }

  return endpointsPromise;
}

function randomString(byteLength: number): string {
  return randomBytes(byteLength)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sha256Base64Url(value: string): string {
  return createHash("sha256")
    .update(value)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createHardcoverState(): string {
  return randomString(24);
}

export function createHardcoverPkcePair(): {
  verifier: string;
  challenge: string;
} {
  const verifier = randomString(32);
  return { verifier, challenge: sha256Base64Url(verifier) };
}

export function safeStateEqual(expected: string, actual: string): boolean {
  const expectedBytes = Buffer.from(expected);
  const actualBytes = Buffer.from(actual);

  return (
    expectedBytes.length === actualBytes.length &&
    timingSafeEqual(expectedBytes, actualBytes)
  );
}

export async function buildHardcoverAuthorizationUrl({
  state,
  codeChallenge,
  redirectUri,
}: {
  state: string;
  codeChallenge: string;
  redirectUri: string;
}): Promise<string> {
  const { clientId } = getClientConfig();
  const endpoints = await getEndpoints();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: HARDCOVER_SCOPES,
  });

  return `${endpoints.authorize}?${params.toString()}`;
}

async function readJson(
  response: Response
): Promise<(HardcoverTokenResponse & TokenErrorPayload) | null> {
  try {
    return (await response.json()) as HardcoverTokenResponse &
      TokenErrorPayload;
  } catch {
    return null;
  }
}

async function postTokenRequest(
  body: URLSearchParams
): Promise<HardcoverTokenResponse> {
  const { clientId, clientSecret } = getClientConfig();
  const endpoints = await getEndpoints();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  let response: Response;
  try {
    response = await fetch(endpoints.token, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
  } catch {
    throw new HardcoverOAuthError(
      "Could not reach Hardcover's token endpoint. Try again in a moment."
    );
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw new HardcoverOAuthError(
      payload?.error_description ||
        payload?.error ||
        `Hardcover token request failed (${response.status}).`,
      { code: payload?.error, status: response.status }
    );
  }

  if (!payload?.access_token) {
    throw new HardcoverOAuthError(
      "Hardcover returned a token response without an access token."
    );
  }

  return payload;
}

async function refreshAccessToken(
  refreshToken: string
): Promise<HardcoverTokenResponse> {
  return postTokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })
  );
}

async function getStoredToken(): Promise<SelectHardcoverOAuthToken | null> {
  const [row] = await db
    .select()
    .from(hardcoverOAuthToken)
    .where(eq(hardcoverOAuthToken.id, 1))
    .limit(1);

  return row ?? null;
}

function accessTokenIsUsable(
  accessToken: string | null | undefined,
  expiresAt: Date | null | undefined
): boolean {
  if (!accessToken || !expiresAt) {
    return false;
  }

  return expiresAt.getTime() > Date.now() + EXPIRY_SKEW_MS;
}

function cacheAccessToken(token: string, expiresAt: Date | null): void {
  const tokenExpiry = expiresAt?.getTime() ?? Date.now() + CACHE_TTL_MS;

  cachedAccessToken = {
    token,
    expiresAt: Math.min(tokenExpiry, Date.now() + CACHE_TTL_MS),
  };
}

async function persistTokens(
  tokens: HardcoverTokenResponse,
  previousRefreshToken?: string | null
): Promise<void> {
  const refreshToken =
    tokens.refresh_token ?? previousRefreshToken ?? null;
  const expiresIn = Number(tokens.expires_in);
  const expiresAt =
    Number.isFinite(expiresIn) && expiresIn > 0
      ? new Date(Date.now() + expiresIn * 1000)
      : // Hardcover access tokens last a week. If expires_in is ever missing,
        // assume the documented lifetime rather than treating it as forever.
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const values = {
    id: 1,
    accessToken: tokens.access_token,
    refreshToken,
    expiresAt,
    scope: tokens.scope ?? null,
    tokenType: tokens.token_type ?? "Bearer",
    refreshLockExpiresAt: null,
    updatedAt: new Date(),
  };

  await db
    .insert(hardcoverOAuthToken)
    .values(values)
    .onConflictDoUpdate({
      target: hardcoverOAuthToken.id,
      set: {
        accessToken: values.accessToken,
        refreshToken: values.refreshToken,
        expiresAt: values.expiresAt,
        scope: values.scope,
        tokenType: values.tokenType,
        refreshLockExpiresAt: null,
        updatedAt: values.updatedAt,
      },
    });

  cacheAccessToken(tokens.access_token, expiresAt);
}

export async function completeHardcoverAuthorization({
  code,
  codeVerifier,
  redirectUri,
}: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<void> {
  const tokens = await postTokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    })
  );

  await persistTokens(tokens);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function claimRefreshLock(): Promise<boolean> {
  const now = new Date();

  const [row] = await db
    .update(hardcoverOAuthToken)
    .set({
      refreshLockExpiresAt: new Date(now.getTime() + REFRESH_LOCK_MS),
    })
    .where(
      and(
        eq(hardcoverOAuthToken.id, 1),
        or(
          isNull(hardcoverOAuthToken.refreshLockExpiresAt),
          lt(hardcoverOAuthToken.refreshLockExpiresAt, now)
        )
      )
    )
    .returning({ id: hardcoverOAuthToken.id });

  return Boolean(row);
}

async function releaseRefreshLock(): Promise<void> {
  await db
    .update(hardcoverOAuthToken)
    .set({ refreshLockExpiresAt: null })
    .where(eq(hardcoverOAuthToken.id, 1));
}

/**
 * Refreshes the app-wide token, serialising the work both inside this process
 * and across server instances. Hardcover rotates refresh tokens and revokes
 * the whole chain if one is spent twice, so two workers must never refresh at
 * the same time.
 */
async function refreshAccessTokenWithLock(): Promise<string> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    for (let attempt = 0; attempt < REFRESH_WAIT_ATTEMPTS; attempt++) {
      const claimed = await claimRefreshLock();

      if (claimed) {
        try {
          // Another instance may have refreshed while we were claiming.
          const row = await getStoredToken();

          if (
            accessTokenIsUsable(row?.accessToken ?? null, row?.expiresAt ?? null)
          ) {
            cacheAccessToken(row!.accessToken!, row!.expiresAt ?? null);
            return row!.accessToken!;
          }

          if (!row?.refreshToken) {
            throw new HardcoverOAuthError(
              "Hardcover is not connected. Visit /settings to connect Hardcover."
            );
          }

          let tokens: HardcoverTokenResponse;
          try {
            tokens = await refreshAccessToken(row.refreshToken);
          } catch (error) {
            if (
              error instanceof HardcoverOAuthError &&
              error.code === "invalid_grant"
            ) {
              // The refresh token was revoked or replayed. Drop the dead
              // credentials so the settings page asks for a reconnect.
              await clearHardcoverTokens().catch(() => undefined);
            }
            throw error;
          }

          await persistTokens(tokens, row.refreshToken);
          return tokens.access_token;
        } finally {
          await releaseRefreshLock().catch(() => undefined);
        }
      }

      await sleep(REFRESH_WAIT_MS);

      const row = await getStoredToken();
      if (accessTokenIsUsable(row?.accessToken ?? null, row?.expiresAt ?? null)) {
        cacheAccessToken(row!.accessToken!, row!.expiresAt ?? null);
        return row!.accessToken!;
      }
    }

    throw new HardcoverOAuthError(
      "Timed out waiting for another Hardcover token refresh to finish."
    );
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

function requirePat(pat: string | null): string {
  if (pat) {
    return pat;
  }

  throw new HardcoverOAuthError(
    "Hardcover is not connected. Visit /settings to connect Hardcover, or set HARDCOVER_TOKEN."
  );
}

/**
 * Returns a bearer token for the GraphQL API. OAuth wins when it is configured
 * and connected; HARDCOVER_TOKEN remains a fallback for local scripts and for
 * the window before the OAuth app is set up.
 */
export async function getHardcoverAccessToken(): Promise<string> {
  const pat = getHardcoverPat();

  if (!isHardcoverOAuthConfigured()) {
    return requirePat(pat);
  }

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }

  let row: SelectHardcoverOAuthToken | null;
  try {
    row = await getStoredToken();
  } catch (error) {
    console.warn(
      "Could not read Hardcover OAuth tokens. Falling back to HARDCOVER_TOKEN. Apply the latest database migration if you have not already.",
      error
    );
    return requirePat(pat);
  }

  if (accessTokenIsUsable(row?.accessToken ?? null, row?.expiresAt ?? null)) {
    cacheAccessToken(row!.accessToken!, row!.expiresAt ?? null);
    return row!.accessToken!;
  }

  if (!row?.refreshToken) {
    return requirePat(pat);
  }

  return refreshAccessTokenWithLock();
}

export async function getHardcoverAuthorizationHeader(): Promise<string> {
  return `Bearer ${await getHardcoverAccessToken()}`;
}

export async function clearHardcoverTokens(): Promise<void> {
  cachedAccessToken = null;

  await db
    .update(hardcoverOAuthToken)
    .set({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      scope: null,
      tokenType: null,
      refreshLockExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(hardcoverOAuthToken.id, 1));
}

async function revokeToken(
  token: string,
  tokenTypeHint: "access_token" | "refresh_token"
): Promise<void> {
  const { clientId, clientSecret } = getClientConfig();
  const endpoints = await getEndpoints();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(endpoints.revoke, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      token,
      token_type_hint: tokenTypeHint,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new HardcoverOAuthError(
      `Hardcover token revocation failed (${response.status}).`,
      { status: response.status }
    );
  }
}

/**
 * Revokes the tokens at Hardcover (so the session disappears from the user's
 * Authorized Apps page) and clears the local copy.
 */
export async function disconnectHardcover(): Promise<void> {
  cachedAccessToken = null;

  if (!isHardcoverOAuthConfigured()) {
    await clearHardcoverTokens().catch(() => undefined);
    return;
  }

  let row: SelectHardcoverOAuthToken | null = null;
  try {
    row = await getStoredToken();
  } catch (error) {
    console.warn("Could not read Hardcover OAuth tokens before disconnecting.", error);
  }

  const token = row?.refreshToken ?? row?.accessToken;
  if (token) {
    try {
      await revokeToken(token, row?.refreshToken ? "refresh_token" : "access_token");
    } catch (error) {
      // Local cleanup still matters even if Hardcover is unreachable; the
      // access token expires within a week either way.
      console.warn("Could not revoke the Hardcover token remotely.", error);
    }
  }

  await clearHardcoverTokens();
}

export async function getHardcoverConnectionStatus(): Promise<HardcoverConnectionStatus> {
  const configured = isHardcoverOAuthConfigured();
  const patFallback = Boolean(getHardcoverPat());
  const base: HardcoverConnectionStatus = {
    configured,
    connected: false,
    patFallback,
    scope: null,
    expiresAt: null,
    tokenType: null,
  };

  if (!configured) {
    return base;
  }

  try {
    const row = await getStoredToken();
    return {
      ...base,
      connected: Boolean(row?.accessToken || row?.refreshToken),
      scope: row?.scope ?? null,
      expiresAt: row?.expiresAt?.toISOString() ?? null,
      tokenType: row?.tokenType ?? null,
    };
  } catch (error) {
    console.warn("Could not read the Hardcover OAuth token row.", error);
    return {
      ...base,
      error:
        "Could not read the Hardcover token table. Apply the latest database migration.",
    };
  }
}
