import fs from "node:fs";
import path from "node:path";

const AUTH_DIR = path.join(process.cwd(), "tests/e2e/.auth");

export const AUTH_STATE = path.join(AUTH_DIR, "user.json");
export const AUTH_META = path.join(AUTH_DIR, "meta.json");

export interface TestAuth {
  email: string;
  password?: string;
}

export interface AuthMeta {
  signedIn: boolean;
  userId?: string;
  email?: string;
}

/**
 * Credentials for the Clerk user used by authenticated specs.
 *
 * `E2E_CLERK_USER_EMAIL` is enough when it is a Clerk test address
 * (`something+clerk_test@example.com`), because Clerk accepts the fixed code
 * 424242 for those. Otherwise set `E2E_CLERK_USER_PASSWORD` as well.
 */
export function getTestAuth(): TestAuth | undefined {
  const email = process.env.E2E_CLERK_USER_EMAIL?.trim();

  if (!email) {
    return undefined;
  }

  return { email, password: process.env.E2E_CLERK_USER_PASSWORD || undefined };
}

export function canSignIn(): boolean {
  return Boolean(getTestAuth() && process.env.CLERK_SECRET_KEY);
}

export function readAuthMeta(): AuthMeta {
  try {
    return JSON.parse(fs.readFileSync(AUTH_META, "utf8")) as AuthMeta;
  } catch {
    return { signedIn: false };
  }
}

export function hasSignedInState(): boolean {
  if (!readAuthMeta().signedIn) {
    return false;
  }

  try {
    const state = JSON.parse(fs.readFileSync(AUTH_STATE, "utf8")) as {
      cookies?: Array<{ name: string }>;
    };

    // Clerk stores its session in a cookie whose name starts with "__session".
    return Boolean(state.cookies?.some((cookie) => cookie.name.startsWith("__session")));
  } catch {
    return false;
  }
}
