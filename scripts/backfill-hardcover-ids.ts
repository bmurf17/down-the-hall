/**
 * Backfills `book.hardcover_id` for rows that were added without a Hardcover
 * match (0 or NULL). Without this the app cannot link those rows to a book
 * detail page.
 *
 * Matching uses Hardcover's search endpoint with "<title> <author>", then
 * scores the candidates on title containment and author name. Only confident
 * matches are written; everything else is reported and left untouched.
 *
 * Usage:
 *   npx tsx scripts/backfill-hardcover-ids.ts                      # dry run, all users
 *   npx tsx scripts/backfill-hardcover-ids.ts --user user_abc      # dry run, one user
 *   npx tsx scripts/backfill-hardcover-ids.ts --user user_abc --apply
 *
 * Requires in .env:
 *   DATABASE_URL
 *   HARDCOVER_TOKEN
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sql = neon(process.env.DATABASE_URL!);
// Hardcover now requires the Bearer scheme; accept a pasted full header too.
const HARDCOVER_TOKEN = process.env.HARDCOVER_TOKEN?.replace(
  /^Bearer\s+/i,
  ""
);

const DELAY_MS = 1500;
const MAX_RETRIES = 3;
const PER_PAGE = 10;
const MIN_TITLE_SCORE = 0.6;
const MIN_AUTHOR_SCORE = 0.7;
const MIN_OVERALL_SCORE = 0.8;

const args = process.argv.slice(2);
const userId = getArg("--user");
const apply = args.includes("--apply");

if (!HARDCOVER_TOKEN) {
  console.error("Missing HARDCOVER_TOKEN in .env");
  process.exit(1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface PendingBook {
  id: number;
  title: string;
  release_year: number | null;
  user_id: string;
  author: string | null;
}

interface Candidate {
  id: number;
  title: string;
  alternativeTitles: string[];
  authorNames: string[];
  releaseYear: number | null;
  titleScore: number;
  authorScore: number;
  score: number;
}

function getArg(name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function titleScore(dbTitle: string, candidate: Candidate): number {
  const db = normalize(dbTitle);
  if (!db) return 0;

  const variants = [candidate.title, ...candidate.alternativeTitles]
    .map(normalize)
    .filter(Boolean);

  const dbTokens = new Set(db.split(" "));
  let best = 0;

  for (const variant of variants) {
    if (variant === db) {
      best = Math.max(best, 1);
      continue;
    }

    const variantTokens = new Set(variant.split(" "));
    let intersection = 0;
    for (const token of dbTokens) {
      if (variantTokens.has(token)) intersection++;
    }
    if (intersection === 0) continue;

    const dbCovered = intersection / dbTokens.size;
    const variantCovered = intersection / variantTokens.size;
    const jaccard =
      intersection / (dbTokens.size + variantTokens.size - intersection);

    // One title being a subset of the other (e.g. subtitle differences) is a
    // strong signal; otherwise fall back to token overlap.
    const containment = Math.max(dbCovered, variantCovered);
    const score = containment >= 1 ? 0.95 : 0.6 * containment + 0.4 * jaccard;
    best = Math.max(best, score);
  }

  return best;
}

function authorScore(dbAuthor: string, candidate: Candidate): number {
  const author = normalize(dbAuthor);
  if (!author) return 0;

  const authorTokens = new Set(author.split(" "));
  let best = 0;

  for (const name of candidate.authorNames) {
    const normalized = normalize(name);
    if (!normalized) continue;

    if (normalized === author) {
      best = Math.max(best, 1);
      continue;
    }

    if (normalized.includes(author) || author.includes(normalized)) {
      best = Math.max(best, 0.85);
      continue;
    }

    const nameTokens = new Set(normalized.split(" "));
    let shared = 0;
    for (const token of authorTokens) {
      if (nameTokens.has(token)) shared++;
    }
    const ratio = shared / authorTokens.size;
    if (ratio >= 0.6) {
      best = Math.max(best, 0.7 * ratio);
    }
  }

  return best;
}

async function searchHardcover(
  book: PendingBook
): Promise<Candidate[]> {
  const query = [book.title, book.author].filter(Boolean).join(" ");
  const graphql = `
    query SearchBook($query: String!) {
      search(query: $query, query_type: "Book", per_page: ${PER_PAGE}) {
        ids
        results
      }
    }
  `;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch("https://api.hardcover.app/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HARDCOVER_TOKEN}`,
      },
      body: JSON.stringify({ query: graphql, variables: { query } }),
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

    const hits: any[] = json.data?.search?.results?.hits ?? [];
    return hits
      .map((hit) => {
        const document = hit.document ?? {};
        const candidate: Candidate = {
          id: Number(document.id),
          title: document.title ?? "",
          alternativeTitles: document.alternative_titles ?? [],
          authorNames: document.author_names ?? [],
          releaseYear: document.release_year ?? null,
          titleScore: 0,
          authorScore: 0,
          score: 0,
        };
        candidate.titleScore = titleScore(book.title, candidate);
        candidate.authorScore = authorScore(book.author ?? "", candidate);
        candidate.score =
          0.65 * candidate.titleScore + 0.35 * candidate.authorScore;
        return candidate;
      })
      .filter((candidate) => Number.isFinite(candidate.id) && candidate.id > 0)
      .sort((a, b) => b.score - a.score);
  }

  throw lastError ?? new Error("Hardcover search failed");
}

function isConfident(book: PendingBook, candidate: Candidate): boolean {
  if (candidate.titleScore < MIN_TITLE_SCORE) return false;
  if (book.author?.trim() && candidate.authorScore < MIN_AUTHOR_SCORE) {
    return false;
  }
  return candidate.score >= MIN_OVERALL_SCORE;
}

async function getPendingBooks(): Promise<PendingBook[]> {
  if (userId) {
    return (await sql`
      SELECT b.id, b.title, b.release_year, b.user_id, a.name AS author
      FROM book b
      LEFT JOIN author a ON b.author_id = a.id
      WHERE (b.hardcover_id IS NULL OR b.hardcover_id = 0)
        AND b.user_id = ${userId}
      ORDER BY b.id
    `) as PendingBook[];
  }

  return (await sql`
    SELECT b.id, b.title, b.release_year, b.user_id, a.name AS author
    FROM book b
    LEFT JOIN author a ON b.author_id = a.id
    WHERE (b.hardcover_id IS NULL OR b.hardcover_id = 0)
    ORDER BY b.id
  `) as PendingBook[];
}

async function main() {
  const books = await getPendingBooks();

  if (books.length === 0) {
    console.log("Nothing to backfill - every book already has a Hardcover id.");
    return;
  }

  console.log(
    `Found ${books.length} book(s) without a Hardcover id` +
      `${userId ? ` for ${userId}` : ""}.`
  );
  console.log(apply ? "Applying confident matches.\n" : "Dry run only.\n");

  let matched = 0;
  let skipped = 0;
  let failed = 0;

  for (const book of books) {
    const label = `[${book.id}] "${book.title}"${book.author ? ` by ${book.author}` : ""}`;

    try {
      const candidates = await searchHardcover(book);
      const best = candidates[0];

      if (!best || !isConfident(book, best)) {
        skipped++;
        if (best) {
          console.log(
            `  SKIP ${label}\n       best guess: ${best.id} "${best.title}" (${best.releaseYear ?? "?"}) ` +
              `[title ${best.titleScore.toFixed(2)}, author ${best.authorScore.toFixed(2)}]`
          );
        } else {
          console.log(`  SKIP ${label} - no search results`);
        }
        await sleep(DELAY_MS);
        continue;
      }

      matched++;
      console.log(
        `  ${apply ? "SET " : "MATCH"} ${label} -> ${best.id} "${best.title}" ` +
          `(${best.releaseYear ?? "?"}) [title ${best.titleScore.toFixed(2)}, author ${best.authorScore.toFixed(2)}]`
      );

      if (apply) {
        await sql`
          UPDATE book
          SET hardcover_id = ${best.id}
          WHERE id = ${book.id}
            AND (hardcover_id IS NULL OR hardcover_id = 0)
        `;
      }

      await sleep(DELAY_MS);
    } catch (err: any) {
      failed++;
      console.log(`  FAIL ${label} - ${err.message}`);
      await sleep(DELAY_MS);
    }
  }

  console.log("\n=== Summary ===");
  console.log(
    `${apply ? "Updated" : "Would update"}: ${matched}  Skipped: ${skipped}  Failed: ${failed}`
  );

  if (!apply && matched > 0) {
    console.log("\nRe-run with --apply to write these changes.");
  }
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
