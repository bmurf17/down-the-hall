# Down The Hall — Cleanup TODO

Remaining items from the code review. The low-risk fixes (mechanical bugs, build
config, dead code) are already done; everything below is the follow-up work.

Verify changes with:

```bash
npm run typecheck
npm run lint
npm run build
```

---

## 1. Correctness bugs (do first)

- [x] **Book detail page is missing most metadata.**
      `actions/hardcoverActions.ts:34` — `BOOK_BY_ID_QUERY` only selects
      `id`, `default_physical_edition_id`, `users_count`, `users_read_count`,
      `cached_image`, `cached_contributors`, `description`, `release_year`,
      `title`. `processTrendingBookDetails` also reads `book_series`,
      `contributions`, `pages`, and `genres`, so the detail page loses the
      author, series position, and page count. Add the missing fields (and
      select `cached_image`/`cached_contributors` the same way
      `BOOKS_BY_IDS_QUERY` does).
- [x] **Series data is never populated.**
      `actions/hardcoverActions.ts:193` and `:241` — `Object.values(booksResponse.data)`
      returns `[booksArray]`, so `.filter(book => book.book_series)` never
      matches. Use `booksResponse.data.books.map(...)` (same for `getBooksByIsbn`
      and `fetchTrendingData`). Trending/series names are currently always empty.
- [x] **Note page numbers never render.**
      `app/api/books/[userId]/[bookId]/route.ts:33` returns `page_number`, but
      `components/bookDetails/_Notes.tsx` reads `note.pageNumber` (the typed
      `SelectBookNote` shape). Normalise the snake_case row into the expected
      camelCase shape before returning.
- [x] **Server actions are not awaited.**
      `functions/addBook.ts:25`, `functions/addBookNote.ts:17`,
      `functions/addGoal.ts:12`, `functions/editBook.ts:12` call the action
      without `await`. The client gets a success toast before the write (and
      errors are lost). `await` each call and let errors propagate.
- [x] **`addBook` swallows failures for existing authors.**
      `actions/bookActions.ts` — the new-author branch rethrows, but the
      existing-author branch only `console.log`s. Callers report success even
      when the insert fails. Make it throw (and run book + activity-log insert
      in one transaction).
- [x] **Editing through the status dropdown loses page count.**
      `functions/editBook.ts` / `AddToListButton` / `_CurrentlyReadingCard`
      never pass `page_count`, while `BookListItem` passes it when editing
      directly. Thread the field through or drop the inconsistent parameter.
- [x] **Revalidation targets are wrong.**
      `actions/bookActions.ts:135-136` calls `revalidatePath("user-data")`
      (that is a **tag**, not a path) and `revalidatePath("user")` (missing a
      leading `/`). Decide on tags vs paths and use `revalidateTag`/`revalidatePath`
      consistently with the fetchers.
- [x] **`deleteBook` is not transactional.**
      `actions/bookActions.ts:182` deletes notes, activity logs, and the book in
      three independent statements. Wrap in a transaction, and remove the
      associated storage image (or leave it to `cleanup-orphaned-images.ts`
      explicitly).
- [x] **Search does N+1 fetches and discards work.**
      `actions/openLibraryActions.ts` `searchBooks` fetches each work document
      individually and calls `searchWithISBNFallbackGooglebooks` /
      `searchWithISBNFallbackHardCover` without using the results. Batch or
      remove the dead calls.
- [x] **`TRENDING_BOOKS_QUERY` ignores its date range.**
      `actions/hardcoverActions.ts` hardcodes `from: ""` / `to: ""` and
      `offset: 10`. Either pass real variables (and a current month) or remove
      the misleading arguments.

## 2. Security / data ownership

- [x] **Server actions have no ownership checks.**
      `deleteBook` and `editBook` in `actions/bookActions.ts` accept any id.
      Add `currentUser()` and scope the update/delete with
      `and(eq(book.id, id), eq(book.userId, user.id))`; same for the author
      actions if they are ever restored.
- [x] **API routes trust the URL `userId`.**
      `/api/stats/[userId]`, `/api/goals/[userId]`, `/api/books?user=`, and
      `/api/useractivitylog?userId=` return any user's data (including notes)
      without checking the session. If this is intentional social behaviour,
      document it; otherwise derive the user from Clerk and drop the param.
- [x] **GraphQL queries interpolate user input.**
      `actions/hardcoverActions.ts` builds queries with template strings
      (`BOOK_BY_ID_QUERY(id)`, `SERIES_BY_ID_QUERY(...)`,
      `FIND_BOOKS_BY_ISBN_QUERY(...)`). `bookId` comes straight from the URL.
      Convert these to GraphQL variables (`$id: Int!`, `$ids: [Int!]!`, etc.),
      matching `BOOKS_BY_IDS_QUERY`.
- [x] **`pg` pool is created per request.**
      `actions/bookActions.ts:43` constructs a new `Pool` on every `addBook`
      and never calls `.end()`. Reuse a module-level pool (or use Drizzle's
      client) rather than mixing Drizzle/neon-http with `pg`.

## 3. Architecture / duplication

- [x] **Stop self-fetching API routes from server code.**
      `app/track/page.tsx`, `app/book/[bookId]/page.tsx`,
      `functions/getactivtyLog.ts`, and `app/page.tsx` call
      `${NEXT_PUBLIC_API_URL}/api/...` from server components. This adds a
      network hop, requires the env var at build/runtime, and `/track` returns
      `null` when it is missing. Call the DB queries directly.
- [x] **Extract shared queries.**
      The "user + currently reading books" query is duplicated in
      `app/page.tsx`, `app/api/users/route.ts`, `app/api/users/[userId]/route.ts`,
      and `app/users/page.tsx`. The goals query is duplicated in
      `app/page.tsx` and `app/api/goals/[userId]/route.ts`. Add
      `lib/queries/books.ts` / `lib/queries/users.ts` and reuse.
- [ ] **Split `actions/openLibraryActions.ts`.**
      ~620 lines mixing Google Books, OpenLibrary, Hardcover, and response
      types. Move to `lib/books/google.ts`, `lib/books/openlibrary.ts`,
      `lib/books/hardcover.ts`.
- [ ] **Separate storage from conversion helpers.**
      `helpers/convertOpenLibrary.ts` and `helpers/convertTrendingBookToBook.ts`
      are `"use server"` modules that both fetch remote images and upload to
      Supabase. Keep conversion pure and move uploads into
      `lib/supabase-storage.ts`.
- [x] **Consolidate status labels.**
      `components/shared/AddToListButton.tsx` still builds its own status list
      via `Object.keys(Status)` + a local `readingStatusString`. Use
      `types/enums/statusEnum.ts` as the single source.
- [x] **Consolidate `classNames`.**
      A local copy remains in `components/home/CentralDisplay.tsx` and
      `components/track/_TrackBookViewLogic.tsx`; `lib/utils.ts` already exports
      `cn`.
- [ ] **Repeated Tailwind button styles.**
      The same long class string appears three times in
      `components/shared/BookListItem.tsx` and again in `AddToListButton` /
      `_Notes`. Move to `components/ui/button` variants or a small component.
- [x] **`Track` view tabs are duplicated.**
      `components/track/Track.tsx:316-351` renders five identical `TabPanel`s,
      and every panel receives the same `paginatedBooks`. Either make each tab
      filter by status client-side or render a single panel.
      Also seed `selected` from the `order` query param so the sort dropdown
      reflects the URL.
- [x] **`_BookListView` column selector only supports one extra column.**
      The `Select` is single-value while the state is an array; switching
      columns replaces rather than toggles. Use a multi-select/checklist.
- [ ] **Page shell duplicated.**
      `mx-16` / page wrappers are repeated in every page. Move the layout into
      `app/layout.tsx` or a shared `<Page>` wrapper.

## 4. Types & consistency

- [ ] **Remove remaining `any` / `@ts-ignore`.**
      ~40 occurrences, concentrated in `actions/bookActions.ts`,
      `app/page.tsx`, `app/book/[bookId]/page.tsx`, and the Hardcover types.
      Type the query row shapes instead of suppressing.
- [x] **Replace `var` with `const`/`let`.**
      Still in `actions/bookActions.ts`, `helpers/convertSeriesBook.ts`,
      `helpers/convertTrendingBookToBook.ts`, `app/find/page.tsx`, and
      `components/shared/BookListItem.tsx`.
- [x] **`types/apiResponse/*` drift from the DB schema.**
      `BookDetails.genres` is `string | null` but the column is `text[]`;
      `seriesPosition`/`seriesLength` are `number` but the DB is decimal/int.
      Align these with `SelectBook`.
- [x] **`getBook` returns `undefined` on error.**
      `actions/hardcoverActions.ts` catches and logs, then callers `notFound()`.
      Return `null` consistently and log with context.
- [x] **`app/api/books` uses `fullJoin` unnecessarily.**
      The `WHERE` clauses on `book` turn it into an inner join. Use `leftJoin`
      (or `innerJoin`) for clarity.

## 5. Polish / tooling

- [ ] **Address `<img>` lint warnings.**
      Remaining in `BookDetails`, `_CompletedBookList`, `NavSearchModal`,
      `ActivityLog`, `BookListItem`, `CardCarousel`, `_BookCrazyView`,
      `_BookListView`, `_BookShelfView`, `Users`. Migrate to `next/image`
      (needs `remotePatterns` for Supabase/Hardcover assets) or disable the
      rule with a documented reason. Also fix the missing `alt` in
      `_BookCrazyView.tsx`.
- [x] **Add Prettier + `eslint-config-prettier`.**
      Formatting is mixed (4-space in places, 2-space elsewhere). Add
      `.prettierrc`, `format` script, and run once.
- [x] **Write the README.**
      Currently 25 bytes. Document required env vars (`DATABASE_URL`, Clerk
      keys, `HARDCOVER_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`,
      `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_API_URL`), setup, scripts, and
      the one-off `scripts/*.ts` maintenance commands.
- [ ] **Consider dropping `@apollo/client`.**
      Only used for three static GraphQL calls in
      `actions/hardcoverActions.ts`; the maintenance scripts already use plain
      `fetch`. Replacing it removes a large client dependency from the server
      bundle.
- [ ] **Add basic tests.**
      At minimum unit tests for `helpers/convertOpenLibrary.ts`,
      `helpers/convertTrendingBookToBook.ts`, and the matching/scoring helpers
      in `scripts/backfill-hardcover-ids.ts` (pure functions, easy to cover).
- [x] **`npm run typecheck` in CI.**
      The script exists now; wire it (and `lint`/`build`) into a GitHub Action
      so the previous type errors cannot return.
- [x] **Local junk files.**
      Remove `.DS_Store` from the working tree and add it to `.gitignore`
      (currently ignored via the generic rule but present on disk).

---

## Already done (do not redo)

- Fixed inverted book sort direction (`app/api/books/route.ts`).
- Fixed `/api/users` accumulator key.
- Fixed `series_position` always becoming `0`.
- Deterministic fallback cover (removed `Math.random()` hydration mismatch).
- Conditional Notes tab panel.
- Shared status labels in the nav search modal.
- Stats "End Date" label and hardcoded `2024`.
- `tsconfig` `target: ES2017` + `typecheck` script + `parseFloat` type errors.
- Client-safe `lib/storage-urls.ts`; removed hardcoded Supabase URL.
- Deleted dead routes/files (`/test`, `/user`, `components/testing`,
  `UserManagement`, 4 unused icons, unused actions/functions/types/utilities).
- Removed unused `postgres` dependency.
