# Down The Hall

My book tracking website.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Apply the SQL files in `drizzle/` with `npx drizzle-kit migrate` (or
`npx drizzle-kit push` for a throwaway database).

## Environment variables

| Variable                            | Required    | Purpose                                                                                   |
| ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `DATABASE_URL`                      | yes         | Neon/Postgres connection string used by Drizzle and the one-off scripts.                  |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes         | Clerk publishable key.                                                                    |
| `CLERK_SECRET_KEY`                  | yes         | Clerk server key (also used by the Playwright setup project).                             |
| `NEXT_PUBLIC_API_URL`               | recommended | Public origin used for links and the public API (for example `http://localhost:3000`).    |
| `NEXT_PUBLIC_SUPABASE_URL`          | for images  | Supabase project URL used to build public storage URLs.                                   |
| `SUPABASE_SERVICE_ROLE_KEY`         | for uploads | Service-role key used when uploading covers. Never expose this to the client.             |
| `HARDCOVER_TOKEN`                   | fallback    | Personal access token used until an OAuth connection exists; also used by `scripts/*.ts`. |

Hardcover OAuth adds `HARDCOVER_CLIENT_ID`, `HARDCOVER_CLIENT_SECRET`,
`HARDCOVER_REDIRECT_URI` and optionally `HARDCOVER_OWNER_USER_ID`; see the
section below.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # run the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # unit tests (node:test via tsx)
npm run test:e2e   # Playwright (see tests/README.md)
```

One-off maintenance commands in `scripts/` are run with `tsx`, for example:

```bash
npx tsx scripts/backfill-hardcover-ids.ts
npx tsx scripts/cleanup-orphaned-images.ts
npx tsx scripts/migrate-images.ts
npx tsx scripts/refetch-hardcover-images.ts
```

Read each script before running it: several rewrite book rows or storage
objects.

## Hardcover authentication

Hardcover now requires `Authorization: Bearer <token>`. The app supports two
credential types:

1. **OAuth (preferred)** — a single app-wide Hardcover connection, refreshed
   automatically. Access tokens last one week; refresh tokens rotate on every
   use and are stored in the `hardcover_oauth_token` table.
2. **Personal access token (fallback)** — `HARDCOVER_TOKEN` is used until an
   OAuth connection is made, and remains useful for local scripts.

### Create the Hardcover app

1. Open <https://hardcover.app/account/developer-apps/new>.
2. Choose **Web app (server-side)** (confidential client).
3. Add redirect URIs that match the deployment exactly:
   - `https://your-domain/api/hardcover/callback`
   - `http://localhost:3000/api/hardcover/callback` for local development
4. Allow the **`read:catalog`** scope. That covers all of the queries this app
   makes (trending, search, books, editions, series).
5. Leave **Device Authorization Grant** off; this app only uses the standard
   authorization-code flow with PKCE.
6. Copy the client ID and client secret into the environment:

```bash
HARDCOVER_CLIENT_ID=...
HARDCOVER_CLIENT_SECRET=...
HARDCOVER_REDIRECT_URI=https://your-domain/api/hardcover/callback

# Optional: restrict who may connect the app-wide account.
HARDCOVER_OWNER_USER_ID=user_...
```

`HARDCOVER_REDIRECT_URI` must be byte-for-byte identical to a registered
redirect URI. If it is omitted, the app derives it from the request origin.

### Apply the database migration

The OAuth tokens live in a new `hardcover_oauth_token` table. Apply
`drizzle/0019_add_hardcover_oauth_tokens.sql` with your usual migration step,
for example:

```bash
npx drizzle-kit migrate
```

If you use `drizzle-kit push` in this environment instead, that works too.

### Connect

Sign in and visit **Settings → Connect Hardcover**. Approve the consent screen;
you will be redirected back to Settings. The connect route requires a signed-in
Clerk user and, when `HARDCOVER_OWNER_USER_ID` is set, that specific user.

Tokens are never exposed to the browser. The callback validates `state`, the
PKCE verifier, and the `iss` parameter before exchanging the code.

### Disconnecting

Use **Settings → Disconnect**. This revokes the token at Hardcover (so the
session disappears from Authorized Apps) and clears the local copy. Revoking the
app from Hardcover's Authorized Apps page also works; the next refresh will fail
and Settings will ask you to reconnect.

### PAT fallback

`HARDCOVER_TOKEN` still works and is sent as `Bearer <token>`. Once OAuth is
connected, OAuth takes precedence. The maintenance scripts in `scripts/` use
`HARDCOVER_TOKEN` directly.

## End-to-end tests

Playwright covers the signed-out pages, the JSON API and the signed-in
experience:

```bash
npm run test:e2e:install   # first time only
npm run test:e2e           # public, API and (when configured) signed-in specs
npm run test:e2e:public    # no Clerk credentials needed
```

See [tests/README.md](tests/README.md) for the Clerk test-user setup and the
suite layout.
