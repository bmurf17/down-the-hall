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
import {
  authorScore,
  isConfident,
  titleScore,
  type Candidate,
  type PendingBook,
} from "../lib/books/matching";

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

const args = process.argv.slice(2);
const userId = getArg("--user");
const apply = args.includes("--apply");

if (!HARDCOVER_TOKEN) {
  console.error("Missing HARDCOVER_TOKEN in .env");
  process.exit(1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getArg(name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
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
