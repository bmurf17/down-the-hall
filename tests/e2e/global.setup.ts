import { test as setup } from "@playwright/test";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import fs from "node:fs";
import path from "node:path";

import {
  AUTH_META,
  AUTH_STATE,
  canSignIn,
  getTestAuth,
} from "./helpers/auth";

setup("sign in with Clerk", async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_STATE), { recursive: true });

  // Reset any state from a previous run before doing any async work, so a
  // partially completed setup can never leave a session behind.
  fs.writeFileSync(AUTH_META, JSON.stringify({ signedIn: false }));

  if (!canSignIn()) {
    // Write an empty state file so the authenticated project can still start.
    // Those specs skip themselves when no Clerk credentials are configured.
    await page.context().storageState({ path: AUTH_STATE });

    setup.skip(
      true,
      "Set CLERK_SECRET_KEY and E2E_CLERK_USER_EMAIL to run signed-in tests."
    );
    return;
  }

  const auth = getTestAuth()!;

  await clerkSetup();
  await page.goto("/");

  await clerk.signIn({
    page,
    signInParams: auth.password
      ? {
          strategy: "password",
          identifier: auth.email,
          password: auth.password,
        }
      : { strategy: "email_code", identifier: auth.email },
  });

  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.Clerk?.user));

  const userId = await page.evaluate(() => window.Clerk?.user?.id);
  fs.writeFileSync(
    AUTH_META,
    JSON.stringify({ signedIn: true, userId, email: auth.email })
  );

  await page.context().storageState({ path: AUTH_STATE });
});
