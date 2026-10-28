import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Storage operations (upload/list/remove) run against a bucket with RLS
// enabled, so the publishable/anon key is rejected. These helpers are only
// imported by server-side code ("use server" modules, server components and
// route handlers), hence the service role key and the `server-only` guard
// above.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for storage access"
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const BUCKET_NAME = "book-covers";
export const PLACEHOLDER_IMAGE = "placeholder.webp";

export function getPublicImageUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Builds the canonical storage object name for a book cover.
 *
 * Kept in sync with `scripts/refetch-hardcover-images.ts` so the app reuses
 * images that have already been migrated instead of re-uploading them.
 */
export function buildImageFileName(
  id: number | string,
  title: string
): string {
  const slug = title
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 50);

  return `${id}_${slug}.jpeg`;
}
