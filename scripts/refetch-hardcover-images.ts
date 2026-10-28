/**
 * Re-fetches cover images from Hardcover for books whose `image` still points
 * at Firebase Storage (the old project is no longer accessible - returns 402).
 *
 * Each run processes a small batch (default 5) so failures are easy to inspect
 * and the Hardcover API is not hammered.
 *
 * Books that definitively have no cover on Hardcover are pointed at
 * `placeholder.webp`. Transient failures (rate limits, network errors) are left
 * untouched so a later run retries them instead of losing a real cover.
 *
 * Usage:
 *   npx tsx scripts/refetch-hardcover-images.ts            # 5 books
 *   npx tsx scripts/refetch-hardcover-images.ts 10         # 10 books
 *   npx tsx scripts/refetch-hardcover-images.ts 5 --all    # repeat until done
 *
 * Requires in .env:
 *   DATABASE_URL
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   (or SUPABASE_SERVICE_ROLE_KEY)
 *   HARDCOVER_TOKEN
 */
import { neon } from "@neondatabase/serverless";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sql = neon(process.env.DATABASE_URL!);

// Prefer the service role key when present; fall back to the anon key.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey
);

const BUCKET_NAME = "book-covers";
const PLACEHOLDER_PATH = "placeholder.webp";
const HARDCOVER_TOKEN = process.env.HARDCOVER_TOKEN;
const FIREBASE_MATCH = "%firebasestorage.googleapis.com%";
const DELAY_MS = 1500;
const MAX_RETRIES = 3;

const batchSize = Number(process.argv[2]) || 5;
const runAll = process.argv.includes("--all");

if (!HARDCOVER_TOKEN) {
  console.error("Missing HARDCOVER_TOKEN in .env");
  process.exit(1);
}
if (!supabaseKey) {
  console.error(
    "Missing Supabase key in .env (NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY)"
  );
  process.exit(1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface PendingBook {
  id: number;
  title: string;
  hardcover_id: number;
}

async function fetchBookFromHardcover(hardcoverId: number) {
  // NOTE: `cached_image` must be selected as a scalar here. Nesting a
  // subselection (`cached_image { url }`) is rejected by the current schema.
  const query = `query { books_by_pk(id: ${hardcoverId}) { id title cached_image } }`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch("https://api.hardcover.app/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: HARDCOVER_TOKEN!,
      },
      body: JSON.stringify({ query }),
    });

    if (res.status === 429) {
      lastError = new Error("Hardcover rate limit (429)");
      const wait = 10_000 * attempt;
      console.log(`    rate limited, waiting ${wait / 1000}s...`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      throw new Error(`Hardcover HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.errors?.length) {
      throw new Error(json.errors[0].message);
    }

    return json.data?.books_by_pk;
  }

  throw lastError ?? new Error("Hardcover request failed");
}

function safeFileName(hardcoverId: number, title: string) {
  const slug = title
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 50);
  return `${hardcoverId}_${slug}.jpeg`;
}

async function setPlaceholder(bookId: number) {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(PLACEHOLDER_PATH);
  await sql`UPDATE book SET image = ${data.publicUrl} WHERE id = ${bookId}`;
  return data.publicUrl;
}

async function migrateBook(book: PendingBook) {
  const hardcoverBook = await fetchBookFromHardcover(book.hardcover_id);
  const remoteUrl: string | undefined = hardcoverBook?.cached_image?.url;

  // Hardcover has no cover for this book (or doesn't know the ID). This is a
  // definitive answer, so fall back to the placeholder.
  if (!remoteUrl) {
    await setPlaceholder(book.id);
    return { status: "no-cover" as const, reason: "no image on Hardcover" };
  }

  const imageUrl = remoteUrl.startsWith("/")
    ? `https://assets.hardcover.app${remoteUrl}`
    : remoteUrl;

  const filePath = safeFileName(book.hardcover_id, book.title);

  // Already uploaded? Just repoint the DB row.
  const { data: existing, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list("", { search: filePath });

  if (listError) {
    throw new Error(`Supabase list failed: ${listError.message}`);
  }

  if (!existing?.length) {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error(`Image download HTTP ${imageRes.status}`);
    }
    const blob = await imageRes.blob();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: imageRes.headers.get("content-type") || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  await sql`UPDATE book SET image = ${data.publicUrl} WHERE id = ${book.id}`;

  return {
    status: existing?.length ? ("existed" as const) : ("migrated" as const),
    url: data.publicUrl,
  };
}

async function getPendingBooks(limit: number): Promise<PendingBook[]> {
  return (await sql`
    SELECT id, title, hardcover_id
    FROM book
    WHERE image LIKE ${FIREBASE_MATCH}
      AND hardcover_id IS NOT NULL
    ORDER BY id
    LIMIT ${limit}
  `) as PendingBook[];
}

async function countPending(): Promise<number> {
  const [row] = (await sql`
    SELECT COUNT(*)::int AS count FROM book WHERE image LIKE ${FIREBASE_MATCH}
  `) as { count: number }[];
  return row.count;
}

async function main() {
  let totals = { migrated: 0, existed: 0, placeholder: 0, failed: 0 };
  let round = 0;

  while (true) {
    round++;
    const pending = await getPendingBooks(batchSize);

    if (pending.length === 0) {
      if (round === 1) {
        console.log("Nothing left to migrate - every book image is on Supabase.");
      }
      break;
    }

    console.log(`\n--- Batch ${round}: ${pending.length} book(s) ---`);

    for (const book of pending) {
      const label = `[${book.id}] "${book.title}"`;
      try {
        const result = await migrateBook(book);
        if (result.status === "no-cover") {
          console.log(`  PLACEHOLDER ${label} - ${result.reason}`);
          totals.placeholder++;
        } else if (result.status === "existed") {
          console.log(`  EXISTS ${label} - already uploaded, DB repointed`);
          totals.existed++;
        } else {
          console.log(`  OK ${label}`);
          totals.migrated++;
        }
      } catch (err: any) {
        // Transient/technical failure: leave the row untouched so a re-run
        // can retry instead of permanently downgrading it to a placeholder.
        console.log(`  FAIL ${label} - ${err.message} (left queued for retry)`);
        totals.failed++;
      }
      await sleep(DELAY_MS);
    }

    const remaining = await countPending();
    console.log(`Remaining Firebase images: ${remaining}`);

    if (!runAll || remaining === 0) break;
    if (totals.failed > 0 && round >= 3) {
      console.log("\nRepeated failures - stopping. Re-run when fixed.");
      break;
    }
  }

  console.log("\n=== Summary ===");
  console.log(
    `Migrated: ${totals.migrated}  Already present: ${totals.existed}  Placeholder: ${totals.placeholder}  Failed: ${totals.failed}`
  );
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
