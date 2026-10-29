/**
 * Cleans up orphaned images from Supabase Storage bucket.
 * Lists all files in book-covers bucket and deletes any not referenced by
 * book.image or author.image in the database.
 * 
 * Usage:
 *   npx tsx scripts/cleanup-orphaned-images.ts           # dry run (default)
 *   npx tsx scripts/cleanup-orphaned-images.ts --delete  # actually delete
 * 
 * Requires in .env:
 *   DATABASE_URL
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (required for deleting)
 */
import { neon } from "@neondatabase/serverless";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sql = neon(process.env.DATABASE_URL!);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = "book-covers";
const doDelete = process.argv.includes("--delete");

function extractPathFromUrl(url: string): string | null {
  try {
    // Supabase public URL format:
    // https://{project}.supabase.co/storage/v1/object/public/book-covers/{path}
    if (url.includes("/storage/v1/object/public/")) {
      const parts = url.split("/storage/v1/object/public/");
      if (parts[1]) {
        const afterBucket = parts[1].replace(`${BUCKET_NAME}/`, "");
        // Decode if needed
        return decodeURIComponent(afterBucket);
      }
    }
    // If it's just a path
    if (!url.startsWith("http")) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

async function listAllFiles(): Promise<string[]> {
  const allFiles: string[] = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
    
    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
    
    if (!data || data.length === 0) break;
    
    for (const file of data) {
      // Skip folders (they have id null typically)
      if (file.name && file.id) {
        allFiles.push(file.name);
      }
    }
    
    if (data.length < limit) break;
    offset += limit;
  }
  
  return allFiles;
}

async function main() {
  console.log("=== Supabase Storage Cleanup ===\n");
  console.log(`Mode: ${doDelete ? "DELETE (LIVE)" : "DRY RUN"}`);
  console.log(`Bucket: ${BUCKET_NAME}\n`);
  
  // Get all files in bucket
  console.log("Listing all files in bucket...");
  const bucketFiles = await listAllFiles();
  console.log(`Found ${bucketFiles.length} files in bucket\n`);
  
  // Get all referenced images from DB
  console.log("Fetching referenced images from database...");
  const [bookImages, authorImages] = await Promise.all([
    sql`SELECT id, title, image FROM book WHERE image IS NOT NULL`,
    sql`SELECT id, name, image FROM author WHERE image IS NOT NULL`,
  ]);
  
  console.log(`Books with images: ${bookImages.length}`);
  console.log(`Authors with images: ${authorImages.length}\n`);
  
  const referencedPaths = new Set<string>();
  
  for (const book of bookImages) {
    const path = extractPathFromUrl(book.image as string);
    if (path) {
      referencedPaths.add(path);
    }
  }
  
  for (const author of authorImages) {
    const path = extractPathFromUrl(author.image as string);
    if (path) {
      referencedPaths.add(path);
    }
  }
  
  console.log(`Unique referenced paths: ${referencedPaths.size}\n`);
  
  // Find orphaned files
  const orphaned = bucketFiles.filter(f => !referencedPaths.has(f));
  
  console.log(`Orphaned files: ${orphaned.length}\n`);
  
  if (orphaned.length === 0) {
    console.log("No orphaned files found. Bucket is clean!");
    return;
  }
  
  console.log("Orphaned files:");
  for (const file of orphaned.slice(0, 50)) {
    console.log(`  - ${file}`);
  }
  if (orphaned.length > 50) {
    console.log(`  ... and ${orphaned.length - 50} more\n`);
  }
  
  if (!doDelete) {
    console.log("\nThis was a DRY RUN. To actually delete, run with --delete");
    console.log("⚠️  Make sure you have a backup! Deletions cannot be undone.");
    return;
  }
  
  console.log("\nDeleting orphaned files...");
  let deleted = 0;
  let failed = 0;
  
  // Delete in batches of 1000
  for (let i = 0; i < orphaned.length; i += 1000) {
    const batch = orphaned.slice(i, i + 1000);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(batch);
    
    if (error) {
      console.log(`  Batch failed: ${error.message}`);
      failed += batch.length;
    } else {
      deleted += data?.length || batch.length;
      console.log(`  Deleted batch of ${batch.length} files`);
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Deleted: ${deleted}`);
  console.log(`Failed: ${failed}`);
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
