# End-to-end tests

Playwright is used for browser and API tests. The suite is split into three
projects:

| Project         | Spec pattern         | What it covers                                  |
| --------------- | -------------------- | ----------------------------------------------- |
| `public`        | `*.public.spec.ts`   | Signed-out pages, navigation, client-side UI    |
| `api`           | `*.api.spec.ts`      | JSON API routes (no browser needed)             |
| `authenticated` | `*.auth.spec.ts`     | Pages that require a Clerk session              |

## Running

```bash
# First time only
npm run test:e2e:install

# Everything (starts the dev server on port 3000 if needed)
npm run test:e2e

# Only the tests that do not need Clerk credentials
npm run test:e2e:public

# Debugging
npm run test:e2e:headed
npm run test:e2e:ui
```

The dev server is started automatically with `npm run dev` and reused if one is
already running. Set `PLAYWRIGHT_BASE_URL` to point at a different deployment.
When `CI` is set, the server is always started fresh and retries are enabled.

Reports and traces are written to `playwright-report/` and `test-results/`
(both git-ignored). Use `npx playwright show-report` after a run.

## Signed-in tests

The `setup` project signs in once with Clerk and saves the session to
`tests/e2e/.auth/user.json`. The `authenticated` project reuses that state.

Add a test user to your **Clerk development instance**, then set:

```bash
E2E_CLERK_USER_EMAIL=bookworm+clerk_test@example.com
# Optional. Clerk test emails accept the fixed code 424242.
E2E_CLERK_USER_PASSWORD=
```

`CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must also be present
(the app needs them anyway). `clerkSetup()` uses them to fetch a Clerk testing
token so bot protection does not block the automated sign-in. Testing tokens
only work against a Clerk development instance.

When the variables are missing, the setup project writes an empty state file and
the authenticated specs skip themselves instead of failing. `npm run
test:e2e:public` never touches Clerk.

## Test data

The current tests are intentionally read-only: they use a user id that does not
exist (`e2e-user-with-no-books`) and never create, update or delete rows. Point
them at a local or disposable database before adding tests that mutate data.

The home page still asks Hardcover for trending books on the server. Those calls
fail soft, so the shell of the page is asserted rather than book content.

## Layout

```
tests/e2e/
  global.setup.ts        Clerk sign-in + storage state
  fixtures.ts            `test` that skips when no signed-in state exists
  helpers/auth.ts        credentials and storage-state helpers
  public/                signed-out browser specs
  authenticated/         signed-in browser specs
  api/                   request-only API specs
```
