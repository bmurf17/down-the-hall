import { test as base, expect } from "@playwright/test";

import { canSignIn } from "./helpers/auth";

/**
 * Fixture for specs that need a signed-in Clerk session.
 *
 * The `setup` project creates the session. When it is not configured the
 * specs are skipped instead of failing, so the public suite stays usable
 * without Clerk credentials.
 */
export const test = base.extend({});

test.beforeEach(() => {
  test.skip(
    !canSignIn(),
    "No Clerk test user configured. See tests/README.md for setup."
  );
});

export { expect };
