import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
  BUCKET_NAME,
  PLACEHOLDER_IMAGE,
  getPublicImageUrl,
} from "./storage-urls";

export { BUCKET_NAME, PLACEHOLDER_IMAGE, getPublicImageUrl };

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

/**
 * Caches a remote image in Supabase storage and returns the public URL.
 * Pure conversion helpers should call this explicitly rather than uploading
 * while they build their result.
 */
export async function handleImage(
  id: number | string,
  bookTitle: string,
  imageUrl: string
): Promise<string> {
  // Nothing usable upstream: use the shared placeholder.
  if (!imageUrl || imageUrl === PLACEHOLDER_IMAGE) {
    return getPublicImageUrl(PLACEHOLDER_IMAGE);
  }

  // Already stored in our bucket (e.g. a migrated cover) - no work to do.
  if (imageUrl.includes(`/${BUCKET_NAME}/`)) {
    return imageUrl;
  }

  const filePath = buildImageFileName(id, bookTitle);

  const { data: existing, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list("", { search: filePath });

  if (listError) {
    console.error("Error checking Supabase storage:", listError);
  }

  // `search` is a substring match, so confirm the exact object name.
  if (existing?.some((file) => file.name === filePath)) {
    return getPublicImageUrl(filePath);
  }

  try {
    const blob = await urlToBlob(imageUrl);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading image to Supabase:", error);
      // Keep showing the upstream cover rather than masking the failure.
      return imageUrl;
    }

    return getPublicImageUrl(filePath);
  } catch (error) {
    console.error("Error uploading image to Supabase:", error);
    return imageUrl;
  }
}

async function urlToBlob(url: string): Promise<Blob> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error("Error fetching the image:", error);
    throw error;
  }
}
