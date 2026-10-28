export const BUCKET_NAME = "book-covers";
export const PLACEHOLDER_IMAGE = "placeholder.webp";

/**
 * Builds a public URL for an object in the covers bucket.
 *
 * Kept separate from `supabase-storage.ts` so client components can build URLs
 * without importing the service-role Supabase client.
 */
export function getPublicImageUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    return path;
  }

  return `${baseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}
