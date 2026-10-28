import { neon } from "@neondatabase/serverless";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sql = neon(process.env.DATABASE_URL!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET_NAME = "book-covers";
const FIREBASE_BASE =
  "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/";

function decodeFirebaseUrl(url: string): string | null {
  try {
    const withoutBase = url.replace(FIREBASE_BASE, "");
    const filePath = decodeURIComponent(withoutBase.split("?")[0]);
    return filePath;
  } catch {
    return null;
  }
}

function getSupabasePublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

async function migrateBookImages() {
  console.log("Fetching books with Firebase image URLs...");
  const books = await sql`
    SELECT id, title, image FROM book
    WHERE image IS NOT NULL AND image LIKE '%firebasestorage.googleapis.com%'
  `;
  console.log(`Found ${books.length} books to migrate.`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const book of books) {
    const firebasePath = decodeFirebaseUrl(book.image);
    if (!firebasePath) {
      console.log(`  SKIP [${book.id}] "${book.title}" - could not decode URL`);
      skipped++;
      continue;
    }

    const supabasePath = firebasePath;

    // Check if already in Supabase
    const { data: existing } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", { search: supabasePath });

    if (existing && existing.length > 0) {
      const newUrl = getSupabasePublicUrl(supabasePath);
      await sql`UPDATE book SET image = ${newUrl} WHERE id = ${book.id}`;
      console.log(`  EXISTS [${book.id}] "${book.title}" - URL updated`);
      migrated++;
      continue;
    }

    // Download from Firebase
    try {
      const response = await fetch(book.image);
      if (!response.ok) {
        console.log(`  FAIL [${book.id}] "${book.title}" - HTTP ${response.status}`);
        failed++;
        continue;
      }
      const blob = await response.blob();

      // Upload to Supabase
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(supabasePath, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.log(`  FAIL [${book.id}] "${book.title}" - ${error.message}`);
        failed++;
        continue;
      }

      const newUrl = getSupabasePublicUrl(supabasePath);
      await sql`UPDATE book SET image = ${newUrl} WHERE id = ${book.id}`;
      console.log(`  OK [${book.id}] "${book.title}"`);
      migrated++;
    } catch (err: any) {
      console.log(`  FAIL [${book.id}] "${book.title}" - ${err.message}`);
      failed++;
    }
  }

  return { migrated, skipped, failed };
}

async function migrateAuthorImages() {
  console.log("\nFetching authors with Firebase image URLs...");
  const authors = await sql`
    SELECT id, name, image FROM author
    WHERE image IS NOT NULL AND image LIKE '%firebasestorage.googleapis.com%'
  `;
  console.log(`Found ${authors.length} authors to migrate.`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const author of authors) {
    const firebasePath = decodeFirebaseUrl(author.image);
    if (!firebasePath) {
      console.log(`  SKIP [${author.id}] "${author.name}" - could not decode URL`);
      skipped++;
      continue;
    }

    const supabasePath = firebasePath;

    const { data: existing } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", { search: supabasePath });

    if (existing && existing.length > 0) {
      const newUrl = getSupabasePublicUrl(supabasePath);
      await sql`UPDATE author SET image = ${newUrl} WHERE id = ${author.id}`;
      console.log(`  EXISTS [${author.id}] "${author.name}" - URL updated`);
      migrated++;
      continue;
    }

    try {
      const response = await fetch(author.image);
      if (!response.ok) {
        console.log(`  FAIL [${author.id}] "${author.name}" - HTTP ${response.status}`);
        failed++;
        continue;
      }
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(supabasePath, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.log(`  FAIL [${author.id}] "${author.name}" - ${error.message}`);
        failed++;
        continue;
      }

      const newUrl = getSupabasePublicUrl(supabasePath);
      await sql`UPDATE author SET image = ${newUrl} WHERE id = ${author.id}`;
      console.log(`  OK [${author.id}] "${author.name}"`);
      migrated++;
    } catch (err: any) {
      console.log(`  FAIL [${author.id}] "${author.name}" - ${err.message}`);
      failed++;
    }
  }

  return { migrated, skipped, failed };
}

async function main() {
  console.log("=== Firebase → Supabase Image Migration ===\n");

  const bookResults = await migrateBookImages();
  const authorResults = await migrateAuthorImages();

  console.log("\n=== Summary ===");
  console.log(`Books:  ${bookResults.migrated} migrated, ${bookResults.skipped} skipped, ${bookResults.failed} failed`);
  console.log(`Authors: ${authorResults.migrated} migrated, ${authorResults.skipped} skipped, ${authorResults.failed} failed`);
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
